import { HypnoCommand } from "../../types/command";
import ollama, { Message } from "ollama";

export const history: { [key: string]: Message[] } = {};

const helperMessage =
    "You are the AI, your name is Jenifer. The messages from users will be prefixed by their usernames. Respond to the contents inside the quotes, and you can address users by their usernames if relevant.";

const command: HypnoCommand = {
    name: "ai",
    aliases: ["gai"],
    type: "ai",
    usage: [
        ["gai", "Use gai to talk in a global conversation"]
    ],
    description: "Talk to an extremly slow AI :D",

    handler: async (message, args, details) => {
        await message.react(`⏳`);
        await message.channel.sendTyping();

        let conversationID = details.command === "gai" ? "global" : message.author.id;

        // Check if history exists
        if (!history[conversationID])
            history[conversationID] = [
                {
                    role: "system",
                    content: helperMessage
                }
            ];

        let userRequest: Message = {
            role: "user",
            content: `${message.member.nickname ?? message.author.displayName} says: "${args.join(" ")}"`
        };

        history[conversationID].push(userRequest);

        let response = await ollama.chat({
            model: "llama3:8b",
            messages: history[conversationID]
        });

        history[conversationID].push(response.message);

        let parts = response.message.content.match(/.{1,2000}/gs);

        for (let part of parts) {
            await message.reply(part);
        }
    }
};

export default command;