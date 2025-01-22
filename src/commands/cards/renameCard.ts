import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";

const command: HypnoCommand<{ card: Card; name: string }> = {
  name: "renamecard",
  type: "cards",
  description: "Rename a card",

  guards: ["bot-owner"],

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "card",
        type: "card",
      },
      {
        name: "name",
        type: "string",
      },
    ],
  },

  handler: async (message, { args }) => {
    await database.run(
      `UPDATE cards SET name = ? WHERE id = ?`,
      args.name,
      args.card.id
    );
    return message.reply(`Changed the card's name!`);
  },
};

export default command;
