import { DataManager, EmbedBuilder, EmbedData, HexColorString } from "discord.js";
import config from "../config";
import * as fs from "fs";
import { getImpositionFor } from "./actions/imposition";

export function createEmbed(): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(config.embed.color as HexColorString)
        .setTimestamp()
        .setColor("#630091");
}

export function getRandomImpositionFromFile(): string {
    const data = fs.readFileSync(__dirname + "/../data/impo.txt", "utf-8").split("\n");
    return data[Math.floor(Math.random() * data.length)];
}

export async function getRandomImposition(f?: string, allowBombard: boolean = false): Promise<string> {
    if (!f) return getRandomImpositionFromFile();

    // Get for user
    let impos = (await getImpositionFor(f) as UserImposition[]);
    if (allowBombard === false) impos = impos.filter(x => !x.is_bombardable);
    let strImpos = impos.map(x => x.what);

    if (strImpos.length === 0) return getRandomImpositionFromFile();
    return strImpos[Math.floor(Math.random() * strImpos.length)];
}

export function gcd(a: number, b: number): number {
    return (b == 0) ? a : gcd(b, a % b);
}

const characters = "abcdefghijklmnopqrstuvwxyz".split("");
export function generateCode(length: number): string {
    let result = "";
    for (let i = 0; i != length; i++)
        result += characters[Math.floor(Math.random() * characters.length)];
    return result;
}

export function randomFromRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function fixMagicVariablesInEmbed(embed: EmbedBuilder, serverSettings: ServerSettings): EmbedBuilder {
    // Base stuff
    for (const i in embed) {
        if (typeof embed[i] === "string")
            embed[i] = embed[i].replace(/\$prefix/g, serverSettings.prefix);
    }

    // Fields
    for (const i in embed.data.fields)
        embed.data.fields[i].value = embed.data.fields[i].value.replace(/\$prefix/g, serverSettings.prefix);

    return embed;
}

export function formatDate(date: Date) {
    // Extract components from the date object
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // Combine them into the desired format
    return `${year}/${month}/${day} ${hours}:${minutes}`;
}