import {
  EmbedBuilder,
  GuildMember,
  HexColorString,
  PermissionResolvable,
  Role,
  User,
} from "discord.js";
import config from "../config";
import * as fs from "fs";
import path from "path";
import axios from "axios";
import { client } from "..";
import { actions } from "./database";

const randomCodeCharacters = "abcdefghijklmnopqrstuvwxyz".split("");
const progressBarEmpty = "░";
const progressBarFilled = "█";

/**
 * Gets all files from a directory
 * @param dirPath The path to search
 * @param arrayOfFiles The current array of files
 * @returns An array of files in the directory
 */
export default function getAllFiles(
  dirPath: string,
  arrayOfFiles: string[] = [],
): string[] {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach((file) => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(dirPath + (dirPath.endsWith("/") ? "" : "/") + file);
    }
  });

  return arrayOfFiles;
}

export type RandomMinMax = number | { min: number; max: number };

/**
 * Picks a random number from different formats
 */
export function randomMinMax(value: RandomMinMax): number {
  if (typeof value === "number") return value;
  else return randomFromRange(value.min, value.max);
}

/**
 * Creates the base embed for all embeds
 * @returns The created embed
 */
export function createEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(
      (client.user?.id === config.devBot.id
        ? config.embed.devColor
        : config.embed.color) as HexColorString,
    )
    .setTimestamp();
}

/**
 * Returns a random default imposition from the impo.txt
 * @returns The random imposition
 */
export function getRandomImpositionFromFile(): string {
  const data = fs
    .readFileSync(__dirname + "/../data/impo.txt", "utf-8")
    .split("\n");
  return data[Math.floor(Math.random() * data.length)];
}

/**
 * Gets a random bit of imposition for a user
 * @param forWho The user
 * @param allowBombard Allow bombard impositions
 * @returns The random imposition
 */
export async function getRandomImposition(
  forWho?: string,
  allowBombard: boolean = false,
): Promise<string> {
  if (!forWho) return getRandomImpositionFromFile();

  // Get for user
  let impos = (await actions.triggers.getAllFor(forWho)) as UserImposition[];
  if (allowBombard === false) impos = impos.filter((x) => !x.is_bombardable);
  let strImpos = impos.map((x) => x.what);

  if (strImpos.length === 0) return getRandomImpositionFromFile();
  return strImpos[Math.floor(Math.random() * strImpos.length)];
}

/**
 * Used for rations, IDK how it works
 * @param a
 * @param b
 * @returns
 */
export function gcd(a: number, b: number): number {
  return b == 0 ? a : gcd(b, a % b);
}

/**
 * Generates a random code
 * @param length
 * @returns
 */
export function generateCode(length: number): string {
  let result = "";
  for (let i = 0; i != length; i++)
    result +=
      randomCodeCharacters[
        Math.floor(Math.random() * randomCodeCharacters.length)
      ];
  return result;
}

/**
 * Generates a random number given a range
 * @param min Minimum number
 * @param max Maximum number
 * @returns The random number
 */
export function randomFromRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function biasedRandomFromRange(min: number, max: number): number {
  const r = Math.random();
  const skewed = Math.sqrt(r);
  return Math.floor(min + (max - min) * skewed);
}

/**
 * Replaces things like $prefix with the correct things
 * @param embed The embed to fix
 * @param serverSettings The server settings to get stuff from
 * @returns The fixed embed
 */
export function fixMagicVariablesInEmbed(
  embed: EmbedBuilder,
  serverSettings: ServerSettings,
): EmbedBuilder {
  // Base stuff
  for (const i in embed) {
    if (typeof embed[i] === "string")
      embed[i] = embed[i].replace(/\$prefix/g, serverSettings.prefix);
  }

  // Fields
  for (const i in embed.data.fields)
    embed.data.fields[i].value = embed.data.fields[i].value.replace(
      /\$prefix/g,
      serverSettings.prefix,
    );

  return embed;
}

/**
 * Turns a date into the database used date (yyyy/mm/dd hh:mm)
 * @param date The date to convert
 * @returns The converted string
 */
export function formatDate(date: Date): string {
  // Extract components from the date object
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  // Combine them into the desired format
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

/**
 * Creates a backup of the database
 */
export function createBackup() {
  let folder = path.normalize(path.resolve(__dirname, "../../data_backups"));

  if (!fs.existsSync(folder)) fs.mkdirSync(folder);

  fs.copyFileSync(
    __dirname + "/../../data.db",
    folder + `/${new Date().toDateString().replace(/\//g, "-")}.db`,
  );
}

/**
 * Compares how similar to strings are
 * @copyright Stolen from package string-similarity
 * @param first The first string
 * @param second The second string
 * @returns The similarity
 */
export function compareTwoStrings(first: string, second: string): number {
  first = first.replace(/\s+/g, "");
  second = second.replace(/\s+/g, "");

  if (first === second) return 1; // identical or empty
  if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string

  let firstBigrams = new Map();
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;

    firstBigrams.set(bigram, count);
  }

  let intersectionSize = 0;
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;

    if (count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }

  return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

/**
 * Downloads a file to a path
 * @param link The link to download
 * @param path The path to downlod to
 */
export function downloadFile(link: string, path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(path);

    axios
      .get(link, {
        responseType: "stream",
      })
      .then((response) => {
        response.data.pipe(writer);

        writer.on("error", (err) => {
          reject(err);
        });

        writer.on("finish", () => {
          resolve();
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * Generates a simple ASCII progress bar
 * @param percentage The current progress
 * @param length How long the bar should be
 * @returns The ASCII progress bar
 */
export function makePercentageASCII(
  percentage: number,
  length: number,
): string {
  const percentagePer = 100 / length;
  const amount = Math.round(percentage / percentagePer);

  return `${progressBarFilled.repeat(amount)}${progressBarEmpty.repeat(
    length - amount,
  )}`;
}

export async function getUser(id: string): Promise<User | null> {
  try {
    return await client.users.fetch(id);
  } catch (e) {
    return null;
  }
}

export function checkBoolean(value: string): boolean | null {
  if (["true", "yes", "on", "y"].includes(value)) return true;
  else if (["false", "no", "off", "n"].includes(value)) return false;
  return null;
}

export function isURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function englishifyList(list: string[], useOr = false): string {
  if (list.length === 0) return "";

  let finished = list[0];

  for (let i = 1; i < list.length; i++) {
    if (i === list.length - 1)
      finished += ` ${useOr ? "or" : "and"} ${list[i]}`;
    else finished += `, ${list[i]}`;
  }

  return finished;
}

export function shuffle<T extends any[]>(array: T) {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

const dissallowedPermissions: PermissionResolvable[] = [
  "ManageChannels",
  "ManageMessages",
  "Administrator",
  "KickMembers",
  "BanMembers",
  "ManageGuild",
  "ManageRoles",
];
export async function addRole(member: GuildMember, role: Role): Promise<void> {
  for (const d of dissallowedPermissions)
    if (role.permissions.has(d))
      throw `I cannot give the role as it has a dangerous permission. (${d})`;

  if (
    !member.guild.members.me.permissions.has("ManageRoles") &&
    !member.guild.members.me.permissions.has("Administrator")
  )
    throw `I do not have permissions to give roles.`;

  if (member.guild.members.me.roles.highest.position < role.position)
    throw `I cannot give the role as the role is higher than my role. Please move ${role.name} below mine.`;

  await member.roles.add(role);
}

// Stolen from ChatGPT
export function randomNumberFromString(
  input: string,
  rangeMin: number,
  rangeMax: number,
) {
  // Step 1: Hash the string using a simple hash function
  function simpleHash(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0; // Use bitwise to keep it in 32-bit range
    }
    return hash;
  }

  // Step 2: Use the hash as a seed to generate a deterministic number
  const seed = simpleHash(input);

  // Step 3: Create a pseudo-random number based on the seed
  function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  // Step 4: Map the pseudo-random number to the specified range
  const randomValue = seededRandom(seed);
  return Math.floor(randomValue * (rangeMax - rangeMin + 1)) + rangeMin;
}

export function percent(current: number, goal: number): number {
  if (goal === 0) return 100;
  return Math.round(Math.min((current / goal) * 100, 100));
}
