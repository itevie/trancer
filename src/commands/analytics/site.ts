import { HypnoCommand } from "../../types/util";
import { generateSiteCode } from "../../website";

const command: HypnoCommand = {
    name: "site",
    description: "Get the link to the bots analytic website",
    aliases: ["balanceovertimetop10", "bott", "balovertop10", "balanceovertimeusers", "bou"],
    type: "analytics",

    handler: async (message) => {
        const code = generateSiteCode(message.author.id);
        return message.reply(`https://dawn.rest/discord?auth=${code}`);
    }
};

export default command;