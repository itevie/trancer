import { HypnoCommand } from "../../types/util";
import { getRandomImposition } from "../../util/other";

const command: HypnoCommand = {
    name: "imposition",
    aliases: ["i", "impo"],
    description: "Send a some nice, fuzzy imposition",
    type: "imposition",
    usage: [
        ["$cmd <user>", "Gives another user the imposition! :)"]
    ],

    handler: async (message, { oldArgs: args }) => {
        if (args[0]) {
            const user = args[0].replace(/[<>@]/g, "");
            return message.channel.send(`${args.join(" ")} ${await getRandomImposition(user)} ${message.author.id === "735109350728663080" ? "<@395877903998648322>" : ""} `);
        }
        return message.reply((await getRandomImposition(message.author.id)) + ` ${message.author.id === "735109350728663080" ? "<@395877903998648322>" : ""}`);
    }
}

export default command;