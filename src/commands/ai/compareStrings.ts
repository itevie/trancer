import { HypnoCommand } from "../../types/command";
import { compareTwoStrings } from "../../util/stringSimilar";

const command: HypnoCommand = {
    name: "comparestrings",
    description: "Just a test thing",

    handler: (message, { oldArgs: args }) => {
        if (!args[1])
            return message.reply("Please provide 2 no-whitespace strings");
        return message.reply(`They are ${compareTwoStrings(args[0], args[1]) * 100}% similar`);
    }
}

export default command;