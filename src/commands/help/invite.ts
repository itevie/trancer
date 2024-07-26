import { HypnoCommand } from "../../types/command";

const command: HypnoCommand = {
    name: "invite",
    aliases: ["inv"],
    description: "Invite the bot to your own server",
    type: "help",
    botServerOnly: true,

    handler: (message, args) => {
        return message.reply(`Join our server to invite the bot. Use the \`hideout\` command`);
    }
}

export default command;