import { ColorResolvable, DataManager, EmbedBuilder, EmbedData, HexColorString } from "discord.js";
import config from "../config";
import * as fs from "fs";
import { getImpositionFor } from "./actions/imposition";
import path from "path";
import axios from "axios";

export default function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(file => {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(dirPath + (dirPath.endsWith("/") ? "" : "/") + file);
        }
    });

    return arrayOfFiles;
}

export function createEmbed(): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(config.embed.color as HexColorString)
        .setTimestamp()
        .setColor(config.embed.color as ColorResolvable);
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

export function createBackup() {
    let folder = path.normalize(path.resolve(__dirname, "../../data_backups"));
    if (!fs.existsSync(folder))
        fs.mkdirSync(folder);
    fs.copyFileSync(__dirname + "/../../data.db", folder + `/${new Date().toDateString().replace(/\//g, "-")}.db`);
}

/**
 * 
 * @copyright Stolen from package string-similarity
 * @param first 
 * @param second 
 * @returns 
 */
export function compareTwoStrings(first: string, second: string) {
    first = first.replace(/\s+/g, '')
    second = second.replace(/\s+/g, '')

    if (first === second) return 1; // identical or empty
    if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string

    let firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
        const bigram = first.substring(i, i + 2);
        const count = firstBigrams.has(bigram)
            ? firstBigrams.get(bigram) + 1
            : 1;

        firstBigrams.set(bigram, count);
    };

    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
        const bigram = second.substring(i, i + 2);
        const count = firstBigrams.has(bigram)
            ? firstBigrams.get(bigram)
            : 0;

        if (count > 0) {
            firstBigrams.set(bigram, count - 1);
            intersectionSize++;
        }
    }

    return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

export function downloadFile(link: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(path);

        axios.get(link, {
            responseType: "stream"
        }).then(response => {
            response.data.pipe(writer);

            writer.on("error", err => {
                reject(err);
            });

            writer.on("finish", () => {
                resolve();
            });
        });
    });
}

const empty = "░";
const filled = "█";

export function makePercentageASCII(percentage: number, length: number): string {
    const percentagePer = 100 / length;
    const amount = Math.round(percentage / percentagePer);

    return `${filled.repeat(amount)}${empty.repeat(length - amount)}`;
}