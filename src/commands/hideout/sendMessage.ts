import { HypnoCommand } from "../../types/command";
import getAllFiles from "../../util/getAllFiles";
import { MessageCreateOptions } from "discord.js";

const messageFiles = getAllFiles(__dirname + "/../../messages");
export const messages: { [key: string]: MessageCreateOptions } = {};
for (const messageFile of messageFiles) {
    const name = messageFile.match(/[a-z\-_]+\.ts/)[0].replace(".ts", "");
    const messageImport = require(messageFile).default as MessageCreateOptions;
    messages[name] = messageImport;
}
const types = Object.keys(messages).map(x => `\`${x}\``).join(", ");

let command: HypnoCommand = {
    name: "sendmessage",
    aliases: ["sendmsg"],
    description: `Sends one of the preset made messages`,
    adminOnly: true,
    botServerOnly: true,

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