import { HypnoCommand } from "../../types/util";
import { generateCardEmbed } from "./_util";
import { database } from "../../util/database";

const command: HypnoCommand<{ card: Card }> = {
  name: "setcarddescription",
  aliases: ["setcarddesc"],
  description: "Set a cards description",
  type: "cards",

  guards: ["bot-owner"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "card",
        type: "card",
      },
    ],
  },

  handler: async (message, { args, oldArgs }) => {
    oldArgs.shift();
    let desc = oldArgs.join(" ");

    let card = await database.get(
      `UPDATE cards SET description = ? WHERE id = ? RETURNING *;`,
      desc,
      args.card.id
    );
    return message.reply({
      embeds: [await generateCardEmbed(card)],
    });
  },
};

export default command;
