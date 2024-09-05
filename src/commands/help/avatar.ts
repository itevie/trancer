import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";

const command: HypnoCommand<{ user?: User }> = {
    name: "avatar",
    type: "help",

    args: {
        requiredArguments: 0,
        args: [
            {
                name: "user",
                type: "user"
            }
        ]
    },

    handler: (message, { args }) => {
        let user = args.user ? args.user : message.author;
        return message.reply(`${user.displayAvatarURL({ size: 2048 })}`);
    }
};

export default command;