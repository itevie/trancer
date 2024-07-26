import { HypnoCommand } from "../../types/command";
import config from "../../config.json";

const command: HypnoCommand = {
    name: "verify",
    aliases: ["v"],
    description: "Quickly verify a member - reply to the user in question and use this command",

    handler: async (message, args) => {
        // Check if there is a reply
        if (!message.reference)
            return message.reply(`Please reply to another message to use this command`);
        const repliedTo = await message.fetchReference();
        const member = repliedTo.member;

        await member.roles.add(config.roles.verified);
        await message.delete();
    },

    adminOnly: true,
    botServerOnly: true,
}

export default command;