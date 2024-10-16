import database from "../../database/database.ts";
import type { HypnoCommand } from "../../types/util.d.ts";

const command: HypnoCommand = {
  name: "decks",
  type: "cards",
  description: "Get a list of decks",

  handler: async (message) => {
    return await message.reply(
      `Here are the list of decks:\n\n${
        (await database.decks.getAll()).map((x) => `**${x.name}** *[${x.id}]*`)
          .join(", ")
      }`,
    );
  },
};

export default command;
