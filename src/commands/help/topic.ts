import { HypnoCommand } from "../../types/command";
import { messages } from "../hideout/sendMessage";

const command: HypnoCommand = {
    name: "topic",
    aliases: ["t"],
    description: "Get help on a topic",

    handler: async (message, args) => {
        if (!args[0])
            return message.reply("Please provide a topic name to get info on!");
        const topic = args[0].toLowerCase();

        // Check if it exists
        if (!messages[`help-${topic}`])
            return message.reply(`Invalid topic! Check help`);

        return message.reply(messages[`help-${topic}`]);
    }
}

export default command;