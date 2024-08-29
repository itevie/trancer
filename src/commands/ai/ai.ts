import { HypnoCommand } from "../../types/command";
import ollama, { Message } from "ollama";

export const history: { [key: string]: Message[] } = {};

const helperMessage =
    "You are the AI, your name is Jenifer. The messages from users will be prefixed by their usernames. Respond to the contents inside the quotes, and you can address users by their usernames if relevant.";

let lastAI = 0;

const command: HypnoCommand = {
    name: "ai",
    aliases: ["gai"],
    type: "ai",
    usage: [
        ["gai", "Use gai to talk in a global conversation"]
    ],
    description: "Talk to an extremly slow AI :D",

    handler: async (message, details) => {
        let time = 30000 - (Date.now() - lastAI);
        if (time > 0) {
            return message.reply(`AI is on ratelimit, wait ${time / 1000} seconds`);
        }

        lastAI = Date.now();
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

        let content = details.oldArgs.join(" ");

        if (content.includes("$members")) {
            let members = (await message.guild.members.fetch()).map(x => x.user.username);
            content = content.replace(/\$members/g, members.join(", "));
        }

        let userRequest: Message = {
            role: "user",
            content: `${message.member.nickname ?? message.author.displayName} says: "${content}"`
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