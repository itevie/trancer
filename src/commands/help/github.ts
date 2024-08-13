import config from "../../config";
import { HypnoCommand } from "../../types/command";

const command: HypnoCommand = {
    name: "github",
    type: "help",
    description: "Get the GitHub link for this bot",

    handler: (message) => {
        return message.reply(`${config.credits.github}`);
    }
};

export default command;