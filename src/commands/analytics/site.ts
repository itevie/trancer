import { localhostRunUrl } from "../..";
import { HypnoCommand } from "../../types/command";

const command: HypnoCommand = {
    name: "site",
    type: "analytics",

    handler: async (message) => {
        if (!localhostRunUrl)
            return message.reply(`There is no tunnel!`);
        return message.reply(`The current link is: ${localhostRunUrl}`);
    }
};

export default command;