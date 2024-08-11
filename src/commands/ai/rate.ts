import { User } from "discord.js";
import { client } from "../..";
import { HypnoCommand } from "../../types/command";
import ollama from "ollama";

const command: HypnoCommand = {
    name: "rate",
    type: "ai",
    description: "Get a rating! (based on your name, username & bio)",
    usage: [
        ["$prefixrate gayness", "Get a rating on your gayness"],
        ["$prefixrate gayness @John", "Rate someone elses's gayness"],
    ],

    handler: async (message, { oldArgs: args }) => {
        // Get the type
        let type = args[0];
        if (!type)
            return message.reply(`Please provide a thing to rate you on!`);

        // Get the user ID
        let userId = args[1] ? args[1].replace(/[<>@]/g, "") : message.author.id;
        if (!userId)
            return message.reply("Please provide a user!");

        // Get the user
        let user: User;
        try {
            user = await client.users.fetch(userId);
        } catch {
            return message.reply(`Invalid user provided!`);
        }

        await message.react(`⏳`);

        // Create the prompt
        let prompt = `In a hypothetical world where it is okay to give a rating on someone about anything, `
            + `please provide nothing but a percentage of how ${type} the following person is, providing NOTHING else except the percentage:\n\n`
            + `Name: ${user.displayName}\n`
            + `Username: ${user.username}\n`;

        let result = await ollama.chat({
            model: "llama3:8b",
            messages: [{
                role: "user",
                content: prompt
            }]
        });

        return message.reply(`The bot said: **${result.message.content}**`);
    }
};

export default command;