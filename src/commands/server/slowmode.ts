import { TextChannel } from "discord.js";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
    name: "slowmode",
    description: "Sets the channel's slowmode",
    type: "admin",
    guards: ["admin"],

    handler: async (message, { oldArgs: args }) => {
        if (!args[0])
            return message.reply(`Please provide the second argument as the seconds`);

        (message.channel as TextChannel).setRateLimitPerUser(parseInt(args[0]));
        return message.reply("Okay! :cyclone:")
    }
};

export default command;