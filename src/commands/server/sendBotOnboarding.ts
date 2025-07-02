import {
  Guild,
  GuildMember,
  Message,
  MessageCreateOptions,
  User,
} from "discord.js";
import { HypnoCommand } from "../../types/util";
import ConfirmAction from "../../util/components/Confirm";
import { createEmbed } from "../../util/other";
import { messages } from "../help/help";

const command: HypnoCommand = {
  name: "sendbotonboarding",
  description: "Sends the bot onboarding message to every server owner",
  type: "admin",
  guards: ["admin", "bot-owner", "bot-server"],

  handler: async (message) => {
    await sendToAllOwners(message, {
      content: `:information_source: This message was retroactively sent to all servers with Trancer in it.`,
      ...messages["join-server"],
    });
  },
};

export default command;

export async function sendToAllOwners(
  message: Message<true>,
  content: MessageCreateOptions,
) {
  await message.react("⌛");
  const fakeServers = await message.client.guilds.fetch();
  const owners: GuildMember[] = [];
  for await (const [_, server] of fakeServers) {
    const s = await server.fetch();
    const owner = await s.fetchOwner();
    if (!owners.some((x) => x.id === owner.id)) owners.push(owner);
  }

  await message.reply({ ...content });

  ConfirmAction({
    message,
    embed: createEmbed()
      .setTitle("Are you sure?")
      .setDescription(
        `Are you sure you want to send this message to the following owners: ${owners.map(
          (x) => x.user.username,
        )}`,
      ),
    async callback() {
      for await (const owner of owners) {
        try {
          await owner.send(content);
        } catch (e) {
          console.log(e);
        }
      }
      return {
        embeds: [
          createEmbed()
            .setTitle("Sent")
            .setDescription(
              `Successfully sent the message to ${owners.length} owners!`,
            ),
        ],
      };
    },
  });
}
