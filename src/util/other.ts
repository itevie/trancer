import { DataManager, EmbedBuilder, HexColorString } from "discord.js";
import config from "../config.json";
import * as fs from "fs";

export function createEmbed(): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(config.embed.color as HexColorString)
        .setTimestamp()
        .setColor("#630091")
        .setThumbnail(config.avatar);
}

export function getRandomImposition(): string {
    const data = fs.readFileSync(__dirname + "/../data/impo.txt", "utf-8").split("\n");
    return data[Math.floor(Math.random() * data.length)];
}

export function gcd(a: number, b: number): number {
    return (b == 0) ? a : gcd(b, a % b);
}