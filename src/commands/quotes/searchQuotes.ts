import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { createEmbed, paginate } from "../../util/other";

const command: HypnoCommand<{ query: string }> = {
    name: "searchquotes",
    aliases: ["squote", "quotesearch"],
    description: "Search quotes by words",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "query",
                type: "string"
            }
        ]
    },

    handler: async (message, { args }) => {
        const quotes = await database.all<Quote[]>(`SELECT * FROM quotes;`);
        const matches: Quote[] = [];
        const query = args.query.toLowerCase();

        for await (const quote of quotes) {
            if (quote.content.toLowerCase().includes(query))
                quotes.push(quote);
        }

        const list = matches.map(x => {
            return {
                name: `Quote #${x.id}`,
                value: `*${x.content || "No Content"}*`
            };
        });

        return paginate(message, createEmbed().setTitle(`Quotes matching that query`), list);
    }
};

export default command;