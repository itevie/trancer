import config from "../../config";
import { calculateLevel } from "../../messageHandlers/xp";
import { HypnoCommand } from "../../types/util";
import {
  createPaginatedLeaderboardFromData,
  LeaderboardOptions,
} from "../../util/createLeaderboard";
import { actions } from "../../util/database";
import { createEmbed } from "../../util/other";

export const lbUserDataMap = {
  xp: "xp",
  bumps: "bumps",
  messages: "messages_sent",
  vc: "vc_time",
  ttt_wins: "ttt_win",
  ttt_loses: "ttt_lose",
  ttt_ties: "ttt_tie",
  c4_wins: "c4_win",
  c4_loses: "c4_lose",
  c4_ties: "c4_tie",
  count_ruined: "count_ruined",
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
  "c4_wins",
  "c4_loses",
  "c4_ties",
  "count_ruined",
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
  c4_wins: "c4_wins",
  c4_loses: "c4_loses",
  c4_ties: "c4_ties",
  vctime: "vc",
  count_ruined: "count_ruined",
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
    entryName: "messages",
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
  c4_wins: {
    title: "Most Connect 4 wins",
    entryName: "won",
  },
  c4_loses: {
    title: "Most Connect 4 loses",
    entryName: "lost",
  },
  c4_ties: {
    title: "Most Connect 4 ties",
    entryName: "tied",
  },
  count_ruined: {
    title: "Most times ruining the count",
    entryName: "times",
  },
};

const command: HypnoCommand = {
  name: "leaderboard",
  description: "Get a leaderboard for a specific type (see aliases)",
  aliases: Object.keys(lbMap),
  type: "leaderboards",
  eachAliasIsItsOwnCommand: true,

  handler: async (message, o) => {
    if (o.command === "leaderboard")
      return message.reply(
        `Please use one of the following commands instead: ${Object.keys(lbMap)
          .map((x) => `\`${o.serverSettings.prefix}${x}\``)
          .join(", ")}`
      );
    let data = await actions.userData.getForServer(message.guild.id);

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
