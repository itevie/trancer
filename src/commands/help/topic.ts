import { HypnoCommand } from "../../types/util";
import { fixMagicVariablesInEmbed } from "../../util/other";
import { messages } from "./help";
const command: HypnoCommand = {
    name: "topic",
    aliases: ["t"],
    description: "Get help on a topic",

    handler: async (message, { oldArgs: args, serverSettings }) => {
        if (!args[0])
            return message.reply("Please provide a topic name to get info on!");
        const topic = args[0].toLowerCase();

        // Check if it exists
        if (!messages[`help-${topic}`])
            return message.reply(`Invalid topic! Check help`);

        const msg = messages[`help-${topic}`]
        for (const i in msg.embeds) {
            // @ts-ignore
            msg.embeds[i] = fixMagicVariablesInEmbed(msg.embeds[i], serverSettings);
        }

        return message.reply(messages[`help-${topic}`]);
    }
}

export default command;