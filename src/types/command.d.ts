import { Message } from "discord.js"

type HypnoCommandType = "spirals" | "quotes" | "help" | "imposition" | "uncategorised" | "fun" | "admin";

interface HypnoCommand {
    name: string,
    aliases?: string[],
    description?: string,
    usage?: [string, string][],
    type?: HypnoCommandType,

    except?: (message: Message, args: string[]) => boolean,
    handler: (message: Message, args: string[]) => void,

    adminOnly?: boolean,
    hideoutOnly?: boolean,
    allowExceptions?: boolean,
}