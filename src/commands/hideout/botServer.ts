import { HypnoCommand } from "../../types/command";
import config from "../../config.json";

const command: HypnoCommand = {
    name: "invite",
    description: "Join the bot's server",
    type: "help",

    handler: (message) => {
        return message.reply(config.botServer.invite);
    }
}

export default command;