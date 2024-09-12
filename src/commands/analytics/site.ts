import { localhostRunUrl } from "../..";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
    name: "site",
    description: "Get the link to the bots analytic website",
    aliases: ["balanceovertimetop10", "bott", "balovertop10", "balanceovertimeusers", "bou"],
    type: "analytics",

    handler: async (message) => {
        if (!localhostRunUrl)
            return message.reply(`There is no tunnel!`);
        return message.reply(`The current link is: ${localhostRunUrl}\n\nDo **not** save this URL, as it can change quite frequently.`);
    }
};

export default command;