import { Message, PubSub } from "@google-cloud/pubsub";
import { startDiscordClient } from "./bot";
import { CloudBuildMessage } from "./types/CloudBuild";

const gcpBuildMaps = new Map();

const start = async () => {
  const discordClient = await startDiscordClient();

  const pubsubClient = new PubSub({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
      private_key: process.env.GCP_PRIVATE_KEY,
      client_email: process.env.GCP_CLIENT_EMAIL,
      client_id: process.env.GCP_CLIENT_ID,
    },
  });
  const subscription = pubsubClient.subscription(process.env.PUBSUB_SUBSCRIPTION_NAME!);

  console.log("Listening for build messages");
  subscription.on("message", async (message: Message) => {
    const messageData: CloudBuildMessage = JSON.parse(message.data.toString("utf8"));
    const buildMap = gcpBuildMaps.get(messageData.substitutions?.REPO_NAME ?? "");

    if (!buildMap)
      return console.error("No build map found for project:", messageData.substitutions?.REPO_NAME);

    const channel = await discordClient.channels.fetch(buildMap.discordRoom);

    if (!channel) return console.error("No channel found for project:", buildMap.name);
    if (!channel.isText()) return console.error("Channel is not a text channel");

    channel.send(
      `Build ${messageData.status} for ${buildMap.name} (${messageData.substitutions?.REPO_NAME})`
    );

    message.ack();
  });
};

start();
