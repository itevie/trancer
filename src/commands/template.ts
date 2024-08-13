import { HypnoCommand } from "../types/command";

const command: HypnoCommand = {
    name: "template",
    aliases: ["templatecommand"],
    description: "description",

    examples: [],
    usage: [],

    handler: async (message, args) => {
        return message.reply(`This is a template command!`);
    }
};

export default command;