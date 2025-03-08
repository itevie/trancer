import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";

const command: HypnoCommand<{ name: string }> = {
  name: "+deck",
  type: "cards",
  description: "Create a deck",

  guards: ["bot-owner"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "name",
        type: "string",
      },
    ],
  },

  handler: async (message, { args }) => {
    // Check if deck already exists
    if (await actions.cards.decks.getByName(args.name))
      return message.reply(`That deck already exists!`);

    // Create deck
    await database.run(`INSERT INTO decks (name) VALUES (?)`, args.name);
    let deck = await actions.cards.decks.getByName(args.name);
    return message.reply(`Deck created! ID: **${deck.id}**`);
  },
};

export default command;
