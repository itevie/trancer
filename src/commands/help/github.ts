import { HypnoCommand } from "../../types/command";

const command: HypnoCommand = {
    name: "github",
    description: "Get the GitHub link for this bot",

    handler: (message, args) => {
        return message.reply(`https://github.com/itevie/hypno-discord-bot`);
    }
};

export default command;