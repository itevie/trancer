import { Message } from "discord.js"

type HypnoCommandType = "spirals" | "quotes" | "help" | "imposition" | "uncategorised" | "fun" | "admin" | "messages" | "leaderboards";

interface HypnoCommandDetails {
    serverSettings: ServerSettings,
}

interface HypnoCommand {
    name: string,
    aliases?: string[],
    description?: string,
    usage?: [string, string][],
    examples?: [string, string][],
    type?: HypnoCommandType,

    except?: (message: Message, args: string[]) => boolean,
    handler: (message: Message, args: string[], options: HypnoCommandDetails) => void,

    adminOnly?: boolean,
    hideoutOnly?: boolean,
    allowExceptions?: boolean,
}