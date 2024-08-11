import { TextChannel } from "discord.js";
import { HypnoCommand } from "../../types/command";

const command: HypnoCommand = {
    name: "slowmode",
    adminOnly: true,
    type: "admin",

    handler: async (message, args) => {
        if (!args[0])
            return message.reply(`Please provide the second argument as the seconds`);

        (message.channel as TextChannel).setRateLimitPerUser(parseInt(args[0]));
        return message.reply("Okay! :cyclone:")
    }
};

export default command;