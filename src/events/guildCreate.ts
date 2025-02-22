import { client } from "..";
import { messages } from "../commands/help/help";

client.on("guildCreate", async (server) => {
  try {
    if (messages["join-server"])
      await (await server.fetchOwner()).send(messages["join-server"]);
  } catch (e) {
    console.log(`Failed to send onboarding message to ${server.ownerId}`, e);
  }
});
