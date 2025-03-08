import { Guild, MessageCreateOptions, User } from "discord.js";
import ecoConfig from "../ecoConfig";
import { Server } from "http";

export function currency(amount: number): string {
  return `**${amount}${ecoConfig.currency}**`;
}

export function itemText(
  item: Item,
  amount?: number,
  forceAmount: boolean = false
): string {
  return `**${(amount && amount > 1) || forceAmount ? `${amount} ` : ""}${
    item.emoji ? item.emoji : ""
  }${item.name}${(amount || forceAmount) && amount !== 1 ? "s" : ""}**`;
}

// Embed format: %%%embed%%%{"title": ""}
export function replaceVarString(
  str: string,
  user: User,
  server?: Guild
): MessageCreateOptions {
  const parts = {
    mention: `<@${user.id}>`,
    username: user.username,
    member_count: server.memberCount.toString(),
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
