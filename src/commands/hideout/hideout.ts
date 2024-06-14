import { HypnoCommand } from "../../types/command";
import config from "../../config.json";

const command: HypnoCommand = {
    name: "hideout",
    description: "Join Hypno Hideout",
    type: "help",

    handler: (message, args) => {
        return message.reply(config.hideoutInvite);
    }
}

export default command;