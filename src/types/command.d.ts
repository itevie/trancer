import { Message } from "discord.js"

type HypnoCommandType = "dawnagotchi" | "ranks" | "economy" | "cards" | "badges" | "counting" | "spirals" | "quotes" | "help" | "imposition" | "uncategorised" | "fun" | "admin" | "messages" | "leaderboards" | "ai";

interface HypnoCommandDetails<Args extends { [key: string]: any } = {}> {
    serverSettings: ServerSettings,
    command: string,
    args?: Args,
    oldArgs: string[]
}

interface HypnoCommand<Args extends { [key: string]: any } = {}> {
    name: string,
    aliases?: string[],
    description?: string,
    usage?: [string, string][],
    examples?: [string, string][],
    type?: HypnoCommandType,
    args?: {
        requiredArguments: number,
        args: Argument[],
    }

    except?: (message: Message, args: string[]) => boolean,
    handler: (message: Message, options: HypnoCommandDetails<Args>) => void,

    adminOnly?: boolean,
    botServerOnly?: boolean,
    botOwnerOnly?: boolean,
    allowExceptions?: boolean,
}

interface Argument {
    type: "string" | "number" | "wholepositivenumber" | "user" | "boolean";
    name: string,
    onMissing?: string,
    description?: string,
    mustBe?: any,
}