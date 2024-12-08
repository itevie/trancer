import { EmbedBuilder, Message } from "discord.js";
import { client } from "..";
import { createEmbed, paginate } from "./other";

export function accumlateSortLeaderboardData(data: string[]) {
  const result: { [key: string]: number } = {};

  // Accumulate
  for (const d of data) {
    if (!result[d]) result[d] = 0;
    result[d]++;
  }

  // Sort
  const resultArr: [string, number][] = [];
  for (const i in result) resultArr.push([i, result[i]]);

  return resultArr;
}

interface LeaderboardOptions {
  data: [string, number, any?][];
  replyTo: Message;
  embed: EmbedBuilder;
  description?: string;
  entryName?: string;
  rawName?: boolean;
}

export async function createPaginatedLeaderboardFromData(
  options: LeaderboardOptions
) {
  const data = options.data
    .filter((x) => x[1] !== 0)
    .sort((a, b) => b[1] - a[1]);

  const displaydData: string[] = [];

  for (const i in data) {
    displaydData.push(
      `**${parseInt(i) + 1}.** ${
        options.rawName
          ? data[i][0]
          : (await client.users.fetch(data[i][0])).username.replace(/_/g, "\\_")
      } (**${data[i][2] || data[i][1]}**${
        options.entryName ? ` ${options.entryName}` : ""
      })`
    );
  }

  return paginate({
    embed: options.embed,
    replyTo: options.replyTo as any,
    type: "description",
    data: displaydData,
  });
}

export async function createLeaderboardFromData(
  data: [string, number, any?][],
  description: string | null = null,
  entryName: string | null = "times",
  rawName: boolean = false
): Promise<EmbedBuilder> {
  data = data
    .filter((x) => x[1] !== 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Create text
  let text = `${description ? `*${description}*\n\n` : ""}`;

  for (const i in data) {
    text += `**${parseInt(i) + 1}.** ${
      rawName
        ? data[i][0]
        : (await client.users.fetch(data[i][0])).username.replace(/_/g, "\\_")
    } (**${data[i][2] || data[i][1]}** ${entryName ? entryName : ""})\n`;
  }

  // Create embed
  return createEmbed().setDescription(
    data.length === 0 ? "No results :(" : text
  );
}
