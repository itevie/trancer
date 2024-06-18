import { Message } from "discord.js";

interface HypnoMessageHandler {
    name: string,
    description: string,
    examples?: string[],

    handler: (message: Message) => void,
}