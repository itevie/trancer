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
import { sendToAllOwners } from "./sendBotOnboarding";

const command: HypnoCommand = {
  name: "sendtoowners",
  description: "Sends a message to all bot owners",
  type: "admin",
  guards: ["admin", "bot-owner", "bot-server"],

  handler: async (message) => {
    if (!message.reference) return message.reply(`Please provide reference`);
    const ref = await message.fetchReference();

    await sendToAllOwners(message, {
      content: `:information_source: This announcement was sent to all server owner's that have Trancer`,
      embeds: [
        createEmbed().setDescription(ref.content).setAuthor({
          iconURL: message.author.displayAvatarURL(),
          name: message.author.username,
        }),
      ],
    });
  },
};

export default command;
