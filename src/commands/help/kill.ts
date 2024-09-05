import { HypnoCommand } from "../../types/util";

const command: HypnoCommand = {
    name: "kill",
    description: "Kills the bot",

    adminOnly: true,

    handler: async (message) => {
        await message.reply(`Bye bye!`);
        process.exit(0);
    }
};

export default command;