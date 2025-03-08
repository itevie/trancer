import { HypnoCommand } from "../../types/util";
import { generateCardEmbed, rarities } from "./_util";
import { database } from "../../util/database";

const command: HypnoCommand<{ card: Card; rarity: Rarity }> = {
  name: "setcardrarity",
  type: "cards",
  guards: ["bot-owner"],
  description: "Change a cards rarity",

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "card",
        type: "card",
      },
      {
        name: "rarity",
        type: "string",
        oneOf: rarities,
      },
    ],
  },

  handler: async (message, { args }) => {
    let card = await database.get(
      `UPDATE cards SET rarity = ? WHERE id = ? RETURNING *;`,
      args.rarity,
      args.card.id
    );
    return await message.reply({
      embeds: [await generateCardEmbed(card)],
    });
  },
};

export default command;
