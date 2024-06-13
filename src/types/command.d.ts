import { Message } from "discord.js"

interface HypnoCommand {
    name: string,
    aliases?: string[],
    description?: string,
    usage?: [string, string][],

    except?: (message: Message, args: string[]) => boolean,
    handler: (message: Message, args: string[]) => void,

    adminOnly?: boolean,
    hideoutOnly?: boolean,
    allowExceptions?: boolean,
}