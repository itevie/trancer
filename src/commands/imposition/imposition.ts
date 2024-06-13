import { HypnoCommand } from "../../types/command";
import { getRandomImposition } from "../../util/other";

const command: HypnoCommand = {
    name: "imposition",
    aliases: ["i", "impo"],
    description: "Send a some nice, fuzzy imposition",
    usage: [
        ["$cmd <user>", "Gives another user the imposition! :)"]
    ],

    handler: async (message, args) => {
        if (args[0])
            return message.channel.send(`${args[0]} ${getRandomImposition()}`);
        return message.reply(getRandomImposition());
    }
}

export default command;