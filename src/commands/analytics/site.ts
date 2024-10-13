import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
    name: "site",
    description: "Get the link to the bots analytic website",
    aliases: ["balanceovertimetop10", "bott", "balovertop10", "balanceovertimeusers", "bou"],
    type: "analytics",

    handler: async (message) => {
        return message.reply(`https://discord.dawn.rest`);
    }
};

export default command;