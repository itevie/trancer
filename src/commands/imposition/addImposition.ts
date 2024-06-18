import { HypnoCommand } from "../../types/command";
import { addImpositionFor } from "../../util/actions/imposition";
import { database } from "../../util/database";

const command: HypnoCommand = {
    name: "addimposition",
    aliases: ["addi", "addimpo"],
    type: "imposition",
    description: "Add imposition action that the bot can use on you",
    usage: [
        ["$cmd *impo*", "Adds that imposition for the bot to use on you"],
        ["$cmd bombard *impo*", "Adds the imposition for the bot to use on you - as well as in the $prefixbombard command"]
    ],
    examples: [
        ["$cmd *hugs*", "Allows the bot to hug you."],
        ["$cmd bombard *drop*", "Adds *drop* to the list, but it can ONLY be used in the $prefixbombard command."],
        ["$cmd b *drop*", "Same as the above, but shorter, wow."],
        ["$cmd *hugs*\nb *patpatpat*", "Add multiple at the same time, each impo will be on another line."]
    ],

    handler: async (message, args) => {
        const what = args.join(" ");

        async function add(w: string): Promise<string | null> {
            w = w || "";

            // Check if bombard
            let isBombard = false;
            if (w.startsWith("bombard") || w.startsWith("b")) {
                isBombard = true;
                w = w.replace(/^((bombard)|(b))/, "").trim();
            }

            // Checks
            if (!w) return "Please provide an action"
            if (!w.match(/\*.+\*/))
                return "Invalid action, example: *hugs*";
            if (await database.get(`SELECT 1 FROM user_imposition WHERE user_id = (?) AND what = (?);`, message.author.id, w))
                return "Already added";

            // Add
            await addImpositionFor(message.author.id, w, isBombard);

            return null;
        }

        // Check for many
        if (what.includes("\n")) {
            const manys = what.split("\n");
            const errors = [];

            for await (const i of manys) {
                let res = await add(i);
                if (res) errors.push(res);
            }

            return message.reply(`Added!${errors.length !== 0 ? `\n\nErrors:\n${errors.join("\n")}` : ""}`);
        }

        const error = await add(what);
        return message.reply(!error ? `Added! :cyclone:` : `Didn't add action! Error: ${error}`);
    }
}

export default command;