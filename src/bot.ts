import { Client } from "discord.js";
import "dotenv/config";

export const startDiscordClient = async (): Promise<Client<boolean>> =>
  new Promise((resolve) => {
    console.log("Starting discord bot");

    const token = process.env.DISCORD_BOT_TOKEN;
    const client = new Client({ intents: [] });
    client.login(token);

    client.on("ready", async () => {
      if (!client.user || !client.application) return;
      resolve(client);
    });
  });
