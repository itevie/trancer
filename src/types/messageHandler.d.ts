import { Message } from "discord.js";

interface HypnoMessageHandler {
    name: string,
    description: string,
    examples?: string[],
    botsOnly?: boolean,

    handler: (message: Message) => void,
}