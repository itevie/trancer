import { HypnoCommand } from "../../types/command";
import { getRandomImposition } from "../../util/other";

const command: HypnoCommand = {
    name: "imposition",
    aliases: ["i", "impo"],
    description: "Send a some nice, fuzzy imposition",
    type: "imposition",
    usage: [
        ["$cmd <user>", "Gives another user the imposition! :)"]
    ],

    handler: async (message, args) => {
        if (args[0]) {
            const user = args[0].replace(/[<>@]/g, "");
            if (user.match(/^([0-9]+)$/))
                return message.channel.send(`${args.join(" ")} ${getRandomImposition(user)}`);
            return message.channel.send(`${args.join(" ")} ${getRandomImposition()}`);
        }
        return message.reply(getRandomImposition(message.author.id));
    }
}

export default command;