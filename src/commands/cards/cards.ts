import { User } from "discord.js";
import type { HypnoCommand } from "../../types/util.d.ts";
import database from "../../database/database.ts";
import { aquiredCardsToEmbedText } from "../../util/cards.ts";
import { createEmbed } from "../../util/util.ts";

const command: HypnoCommand<{ user?: User }> = {
  name: "cards",
  description: "Gets a list of cards you have",
  aliases: ["mycards"],

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "user",
        type: "user",
      },
    ],
  },

  handler: async (message, options) => {
    const user = options.args.user || message.author;
    const text = await aquiredCardsToEmbedText(
      await database.cards.aquired.getAllFor(user.id),
    );
    return await message.reply({
      embeds: [
        createEmbed()
          .setTitle(`List of cards for ${user.username}`)
          .setDescription(text),
      ],
    });
  },
};

export default command;
