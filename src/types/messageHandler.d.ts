import { Message } from "discord.js";

interface HypnoMessageHandler {
    handler: (message: Message) => void,
}