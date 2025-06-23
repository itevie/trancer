import { Guild, MessageCreateOptions, User } from "discord.js";
import ecoConfig from "../ecoConfig";

/**
 * Returns a currency string, in the format money:currency:
 */
export function currency(amount: number, notBold: boolean = false): string {
  return `${notBold ? "" : "**"}${amount}${ecoConfig.currency}${notBold ? "" : "**"}`;
}

/**
 * Returns a item string, respecting how many the user has
 * @param forceAmount Whether or not to show the amount if there is none
 */
export function itemText(
  item: Item,
  amount?: number,
  forceAmount: boolean = false,
): string {
  return `**${(amount && amount > 1) || forceAmount ? `${amount} ` : ""}${
    item.emoji ? item.emoji : ""
  }${item.name}${(amount || forceAmount) && amount !== 1 ? "s" : ""}**`;
}

/**
 * Returns the ordinal suffic of a number
 */
export function ordinalSuffixOf(num: number): string {
  let j = num % 10,
    k = num % 100;
  if (j === 1 && k !== 11) {
    return num + "st";
  }
  if (j === 2 && k !== 12) {
    return num + "nd";
  }
  if (j === 3 && k !== 13) {
    return num + "rd";
  }
  return num + "th";
}

/**
 * Escapes special Discord characters
 */
export function escapeDisc(str: string): string {
  return str.replace(/[*]/g, "\\*").replace(/_/g, "\\_").replace(/`/g, "\\`");
}

/**
 * Turns an array into a list
 */
export function list(str: [string, any][]): string {
  return str.map((x) => `**${x[0]}**: ${x[1]}`).join("\n");
}

/**
 * Adds backticks to a string
 */
export function tick(str: string): string {
  return `\`${str}\``;
}

/**
 * Makes a string bold
 */
export function b(str: any): string {
  return `**${str}**`;
}

// Embed format: %%%embed%%%{"title": ""}
export function replaceVarString(
  str: string,
  user: User,
  server?: Guild,
): MessageCreateOptions {
  const parts = {
    mention: `<@${user.id}>`,
    username: user.username,
    member_count: server.memberCount.toString(),
    member_count_ord: ordinalSuffixOf(server.memberCount),
  };

  for (const [k, v] of Object.entries(parts)) {
    str = str.replace(new RegExp(`\{${k}\}`, "g"), v);
  }

  if (str.startsWith("%%%embed%%%")) {
    let options: MessageCreateOptions = {};
    let json = JSON.parse(str.replace("%%%embed%%%", ""));

    let { content, ...embed } = json;
    if (content) options.content = content;

    options.embeds = [embed];

    return options;
  }

  return {
    content: str,
  };
}
