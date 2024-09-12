import { HypnoCommand } from "../../types/util";
import ollama from "ollama";
import { history } from "./ai";

const command: HypnoCommand = {
    name: "summary",
    aliases: ["gsummary"],
    type: "ai",
    description: "Gets the summary of your current AI conversation",

    handler: async (message, details) => {
        let conversationID = details.command === "gsummary" ? "global" : message.author.id;

        // Check if anything has been said yet
        if (!history[conversationID])
            return await message.reply(`There is no conversation to summarise!`);

        await message.react(`⏳`);
        await message.channel.sendTyping();

        let response = await ollama.chat({
            model: "llama3:8b",
            messages: [...history[conversationID], {
                role: "user",
                content: "Please summarise in plain English what the past conversation has been about in 1-2 paragraphs."
            }]
        });

        let parts = response.message.content.match(/.{1,2000}/gs);

        for (let part of parts) {
            await message.reply(part);
        }
    }
};

export default command;