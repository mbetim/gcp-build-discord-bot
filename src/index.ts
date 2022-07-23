import { Message, PubSub } from "@google-cloud/pubsub";
import { MessageEmbed } from "discord.js";
import { startDiscordClient } from "./bot";
import { CloudBuildMessage } from "./types/CloudBuild";

const gcpBuildMaps = new Map();

const statusEmojiMap = new Map([
  ["SUCCESS", ":white_check_mark:"],
  ["FAILURE", ":x:"],
  ["INTERNAL_ERROR", ":x:"],
  ["TIMEOUT", ":x:"],
  ["CANCELLED", ":x:"],
  ["WORKING", ":hourglass:"],
  ["QUEUED", ":checkered_flag:"],
]);

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

    const messageEmbed = new MessageEmbed({ title: "GCP Build Update" });
    messageEmbed.addFields([
      { name: "Project", value: buildMap.name, inline: true },
      {
        name: "Status",
        value: `${statusEmojiMap.get(messageData.status)} ${messageData.status}`,
        inline: true,
      },
    ]);

    messageEmbed.setTimestamp();

    channel.send({ embeds: [messageEmbed] });

    message.ack();
  });
};

start();
