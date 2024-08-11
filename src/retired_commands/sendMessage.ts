import { HypnoCommand } from "../types/command";
import getAllFiles from "../util/getAllFiles";
import { MessageCreateOptions } from "discord.js";


let command: HypnoCommand = {
    name: "sendmessage",
    aliases: ["sendmsg"],
    description: `Sends one of the preset made messages`,
    adminOnly: true,
    botServerOnly: true,
    type: "admin",

    handler: async (message, args) => {
        const type = args[0];

        // Check if it is sending list
        if (type === "list") {
            return message.reply(`List of messages: ${types}`);
        }

        // Check if it is invalid
        if (!messages[type]) {
            return message.reply(`Invalid type! Select one of: ${types}`);
        }

        // Send it
        const msg = messages[type];
        await message.channel.send(msg);
        await message.delete();
    }
}

export default command;