import { Message } from "discord.js";

interface HypnoMessageHandler {
    name: string,
    description: string,
    examples?: string[],
    botsOnly?: boolean,
    noCommands?: boolean,

    handler: (message: Message) => void,
}