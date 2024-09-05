import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";

const command: HypnoCommand = {
    name: "decklist",
    aliases: ["decks"],
    description: "Get a list of decks",
    type: "cards",

    handler: async (message) => {
        let decks = await database.all(`SELECT * FROM decks`) as Deck[];

        return message.reply(`List of decks:\n\n${decks.map(x => `**${x.name}** (${x.id})`).join(", ")}`);
    }
};

export default command;