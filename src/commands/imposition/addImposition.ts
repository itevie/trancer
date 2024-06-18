import { HypnoCommand } from "../../types/command";
import { addImpositionFor } from "../../util/actions/imposition";
import { database } from "../../util/database";

const command: HypnoCommand = {
    name: "addimposition",
    aliases: ["addi", "addimpo"],
    type: "imposition",
    description: "Add imposition action that the bot can use on you",

    handler: async (message, args) => {
        const what = args.join(" ");

        // Check for many
        if (what.includes("\n")) {
            const manys = what.split("\n");
            const errors = [];

            for (const i in manys) {
                if (!manys[i].match(/\*.+\*/))
                    errors.push(`${manys[i]}: Invalid`);
                else if (await database.get(`SELECT 1 FROM user_imposition WHERE user_id = (?) AND what = (?);`, message.author.id, manys[i]))
                    errors.push(`${manys[i]}: Already added`);
                else await addImpositionFor(message.author.id, manys[i]);
            }

            return message.reply(`Added!${errors.length !== 0 ? `\n\nErrors:\n${errors.join("\n")}` : ""}`);
        }

        // Guard
        if (!what)
            return message.reply(`Please provide an action`);
        if (!what.match(/\*.+\*/))
            return message.reply(`Invalid imposition! Please provide it in \\*\\*! Such as: \\*hugs\\*`);

        // Check if already exists
        if (await database.get(`SELECT 1 FROM user_imposition WHERE user_id = (?) AND what = (?);`, message.author.id, what))
            return message.reply(`You have already added that for yourself! :cyclone:`);

        // Add
        await addImpositionFor(message.author.id, what);
        return message.reply(`Added! :cyclone:`);
    }
}

export default command;