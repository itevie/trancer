import { HypnoCommand } from "../../types/util";
import { deleteQuote } from "../../util/actions/quotes";

const command: HypnoCommand = {
    name: "deletequote",
    aliases: ["delquote", "dquote", "dq"],
    description: "Delete a quote",
    type: "quotes",
    adminOnly: true,
    botServerOnly: true,
    allowExceptions: true,

    handler: async (message, { oldArgs: args }) => {
        if (!args[0])
            return message.reply(`Please give an ID to delete!`);
        await deleteQuote(parseInt(args[0]))
        return message.reply(`Done! :cyclone:`);
    }
}

export default command;