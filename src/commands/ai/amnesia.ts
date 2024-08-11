import { HypnoCommand } from "../../types/command";
import { history } from "./ai";

const command: HypnoCommand = {
    name: "amnesia",
    type: "ai",
    description: "Make the AI bot forget your conversation",
    aliases: ["forget", "gamnesia"],

    handler: (message, details) => {
        let conversationID = details.command === "gamnesia" ? "global" : message.author.id;

        if (history[conversationID])
            delete history[conversationID];

        return message.reply(`The bot has forgotten.`);
    }
};

export default command;