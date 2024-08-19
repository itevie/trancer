import { PermissionFlagsBits } from "discord.js";
import { commands } from "../..";
import config from "../../config";
import { HypnoCommand } from "../../types/command";

const command: HypnoCommand<{ category: string, ignoreGuards?: boolean }> = {
    name: "category",
    aliases: ["cat"],
    type: "help",
    description: "Get the list of commands in a category",

    args: {
        requiredArguments: 1,
        args: [
            {
                name: "category",
                type: "string",
                description: `The category to get the commands from`
            },
            {
                name: "ignoreGuards",
                type: "boolean",
                description: `Whether or not to forcefully show admin commands`
            }
        ]
    },

    handler: (message, { args }) => {
        // Compute stuff
        const categories: { [key: string]: string[] } = {};

        for (const i in commands) {
            const cat = commands[i].type ?? "uncategorised";
            let cmd = commands[i];

            const add = () => {
                if (!categories[cat]) categories[cat] = [];
                if (!categories[cat].includes(cmd.name)) {
                    categories[cat].push(cmd.name);
                }
            }

            // Check guards
            if (args.ignoreGuards)
                if (args.ignoreGuards) {
                    add();
                    continue;
                }
            if (cmd.botOwnerOnly && message.author.id !== config.owner)
                continue;
            if (cmd.botServerOnly && message.guild.id !== config.botServer.id)
                continue;
            if (cmd.adminOnly && !message.member.permissions.has(PermissionFlagsBits.Administrator))
                continue;
            add();
        }

        // Check if category existed
        if (!categories[args.category])
            return message.reply(`That category does not exist!\nHere are the categories: ${Object.keys(categories).map(x => `\`${x}\``).join(", ")}`);

        return message.reply(`${categories[args.category].map(x => `\`${x}\``).join(", ")}`);
    }
};

export default command;