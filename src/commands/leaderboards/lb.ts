import config from "../../config";
import { calculateLevel } from "../../messageHandlers/xp";
import { HypnoCommand } from "../../types/util";
import { getAllGuildsUserData } from "../../util/actions/userData";
import {
  createPaginatedLeaderboardFromData,
  LeaderboardOptions,
} from "../../util/createLeaderboard";
import { createEmbed } from "../../util/other";

export const lbUserDataMap = {
  xp: "xp",
  bumps: "bumps",
  messages: "messages_sent",
  vc: "vc_time",
  ttt_wins: "ttt_win",
  ttt_loses: "ttt_lose",
  ttt_ties: "ttt_tie",
};

export const lbTypes = [
  "economy",
  "xp",
  "bumps",
  "messages",
  "vc",
  "rank",
  "ttt_wins",
  "ttt_loses",
  "ttt_ties",
] as const;

const lbMap: Record<string, (typeof lbTypes)[number]> = {
  xpleaderboard: "xp",
  xpl: "xp",
  bumps: "bumps",
  messages: "messages",
  msgs: "messages",
  ttt_wins: "ttt_wins",
  ttt_loses: "ttt_loses",
  ttt_ties: "ttt_ties",
  vctime: "vc",
} as const;

const lbDetails: Record<
  string,
  { description?: string; entryName?: string; footer?: string; title: string }
> = {
  xp: {
    title: "Most XP in server",
  },
  bumps: {
    title: "Most bumps in server",
    footer: "Bump the server with /bump to get higher!",
    entryName: "bumps",
  },
  vc: {
    title: "Most time in VC",
    description: "Who has yapped the most in VC?",
    entryName: "minutes",
  },
  messages: {
    title: "Most messages in server",
    description: "Who has yapped the most?",
    entryName: config.economy.currency,
  },
  ttt_wins: {
    title: "Most TicTacToe wins",
    entryName: "won",
  },
  ttt_loses: {
    title: "Most TicTacToe loses",
    entryName: "lost",
  },
  ttt_ties: {
    title: "Most TicTacToe ties",
    entryName: "tied",
  },
};

const command: HypnoCommand = {
  name: "leaderboard",
  description: "Get a leaderboard for a specific type",
  aliases: Object.keys(lbMap),
  type: "leaderboards",
  eachAliasIsItsOwnCommand: true,

  handler: async (message, o) => {
    let data = await getAllGuildsUserData(message.guild.id);
    console.log(lbUserDataMap[lbMap[o.command]]);
    let organised = data.map((x) => [
      x.user_id,
      x[lbUserDataMap[lbMap[o.command]]],
      lbMap[o.command] === "xp" ? `Level ${calculateLevel(x.xp)}` : null,
    ]) as [string, number, any?][];

    let options = lbDetails[lbMap[o.command]];

    let d: LeaderboardOptions = {
      embed: createEmbed()
        .setTitle(options.title)
        .setFooter(options.footer ? { text: options.footer } : null),
      data: organised,
      replyTo: message,
    };

    if (options.entryName) d.entryName = options.entryName;
    if (options.description) d.description = options.description;

    await createPaginatedLeaderboardFromData(d);
  },
};

export default command;
