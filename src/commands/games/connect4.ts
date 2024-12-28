import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageEditOptions,
  MessageReplyOptions,
  User,
} from "discord.js";
import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";
import config from "../../config";
import wrapGame from "../../util/GameWrapper";
import { currency } from "../../util/textProducer";

const _pieces = {
  r: "🟥",
  b: "🟦",
  rw: "❤️",
  bw: "🩵",
  "-": "◼️",
} as const;

const numbersEmojis = [
  ..."123456789".split(""),
  "keycap_ten",
  "regional_indicator_a",
  "regional_indicator_b",
  "regional_indicator_c",
  "regional_indicator_d",
  "regional_indicator_e",
];

const width = 7;
const height = 6;

type State = "-" | "r" | "b" | "rw" | "bw";

const command: HypnoCommand<{
  user: User;
  bet?: number;
  w?: number;
  h?: number;
}> = {
  name: "connect4",
  aliases: ["c4"],
  description: "Play Connect 4!",
  type: "games",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "user",
        type: "user",
      },
      {
        name: "bet",
        type: "wholepositivenumber",
        description: "The amount you want to bet",
      },
      {
        name: "w",
        type: "wholepositivenumber",
        description: "The width of the board",
        wickStyle: true,
        min: 4,
        max: 14,
      },
      {
        name: "h",
        type: "wholepositivenumber",
        description: "The height of the board",
        wickStyle: true,
        min: 4,
        max: 12,
      },
    ],
  },

  handler: async (message, { args }) => {
    let wid = args.w || width;
    let hei = args.h || height;

    await wrapGame({
      message,
      title: "Connect 4",
      databasePrefix: "c4",
      extra: `Board size: ${wid}x${hei}`,
      opponent: args.user,
      bet: args.bet,
      timeout: 1000 * 60 * 2.5,
      callback: async ({
        message,
        removePlayers,
        player,
        opponent,
        collector,
        setTurn,
      }) => {
        // Setup base stuff
        let turn = Math.random() > 0.5 ? player : opponent;
        let win: "rw" | "bw" | "fp" | "fo" | "t" | "d" | "-" = "-";

        // Create board
        let board: State[][] = [];
        for (let i = 0; i != hei; i++) {
          board.push([]);
          for (let x = 0; x != wid; x++) board[i].push("-");
        }

        function draw(): MessageReplyOptions & MessageEditOptions {
          // Draw the board
          let drawn = "";
          for (const y in board) {
            for (const x in board[y]) {
              drawn += `${_pieces[board[y][x]]}`;
            }
            drawn += "\n";
          }

          // Add numbers underneath
          for (let i = 0; i != wid; i++) {
            let part = numbersEmojis[i];
            if (part == (i + 1).toString()) {
              drawn += `:number_${i + 1}:`;
            } else {
              drawn += `:${part}:`;
            }
          }

          // Construct the buttons under the embed
          let rows: ActionRowBuilder[] = [];
          let current: ActionRowBuilder = new ActionRowBuilder();

          // Only add buttons if game is ongoing
          if (win === "-") {
            for (let i = 0; i != wid + 2; i++) {
              // Check if there is 5 buttons on the current row
              if (current.components.length === 5) {
                rows.push(current);
                current = new ActionRowBuilder();
              }

              // Add forfeit button (1 after all others)
              if (i === wid) {
                current.addComponents(
                  new ButtonBuilder()
                    .setCustomId("game-forfeit")
                    .setLabel("Forfeit")
                    .setStyle(ButtonStyle.Danger)
                );
                continue;
              }

              // Add draw button (2 after all others)
              if (i === wid + 1) {
                current.addComponents(
                  new ButtonBuilder()
                    .setCustomId("game-draw")
                    .setLabel("Draw")
                    .setStyle(ButtonStyle.Danger)
                );
                continue;
              }

              // Add normal button
              current.addComponents(
                new ButtonBuilder()
                  .setCustomId(`play-${i}`)
                  .setLabel((i + 1).toString())
                  .setStyle(ButtonStyle.Primary)
              );
            }
            if (current.components.length !== 0) rows.push(current);
          }

          // Construct the embed message
          let msg: string = "";
          switch (win) {
            case "-":
              msg = `${_pieces[turn === player ? "b" : "r"]} **${
                turn.username
              }** to play.\nNote: forfeiting makes the opponent win.`;
              break;
            case "bw":
            case "fo":
              msg = `**${player.username}** won${
                args.bet ? ` ${currency(args.bet)}` : ""
              }!${win === "fo" ? " (forfeit)" : ""}`;
              break;
            case "rw":
            case "fp":
              msg = `**${opponent.username}** won${
                args.bet ? ` ${currency(args.bet)}` : ""
              }!${win === "fp" ? " (forfeit)" : ""}`;
              break;
            case "t":
            case "d":
              msg = `It was a ${win === "t" ? "tie" : "draw"}!${
                args.bet ? "\nYou both keep your money." : ""
              }`;
              break;
          }

          return {
            embeds: [
              createEmbed()
                .setTitle("Connect 4")
                .setDescription(`${msg}\n\n${drawn}`),
            ],
            // @ts-ignore
            components: rows,
          };
        }

        let msg = await message.edit(draw());

        collector.on("collect", async (i) => {
          // Game Forfeit
          if (i.customId === "game-forfeit") {
            win = i.user.id === opponent.id ? "fo" : "fp";
            await removePlayers(i.user.id === opponent.id ? "p" : "o");
            await msg.edit(draw());
            await i.deferUpdate();
            return;
          }

          // Game Draw
          if (i.customId === "game-draw") {
            await i.deferUpdate();

            // Get the other players username
            let opposite = i.user.id === player.id ? opponent : player;

            // Send confirm message
            let m = await message.channel.send(
              `**${opposite.username}**, **${i.user.username}** wants to draw, say "yes" or "no" in chat.`
            );

            // Await their response
            let r = (
              await m.channel.awaitMessages({
                max: 1,
                filter: (x) =>
                  x.author.id === opposite.id &&
                  ["yes", "no"].includes(x.content.toLowerCase()),
              })
            ).at(0);

            if (r.content === "yes") {
              // The game was drawn
              win = "d";
              await msg.edit(draw());
              await removePlayers("t");
              return;
            } else {
              // Other person said no
              await r.react("👍");
              return;
            }
          }

          // Check if it is the issuer's turn
          if (i.user.id !== turn.id)
            return await i.reply({
              content: "It is not your turn.",
              ephemeral: true,
            });

          // Get the ID of which part to play in
          if (!i.customId.startsWith("play-")) return;
          let play = parseInt(i.customId.split("-")[1]);

          // Check if there are any free left
          if (board[0][play] !== "-") {
            return await i.reply({
              content: "Cannot play here as all slots of been filled.",
              ephemeral: true,
            });
          }

          // Place it
          for (let i = hei - 1; i >= 0; i--) {
            if (board[i][play] === "-") {
              board[i][play] = turn === player ? "b" : "r";
              break;
            }
          }

          // Swap turns
          turn = turn.id === player.id ? opponent : player;
          setTurn(turn.id === player.id ? "p" : "o");

          // Check if all slots have been filled
          let hasDash = false;
          for (const y in board) {
            for (const x in board[y]) {
              if (board[y][x] === "-") {
                hasDash = true;
                break;
              }
            }
            if (hasDash) break;
          }

          // Check if it was a tie
          if (!hasDash) {
            win = "t";
          } else {
            win = checkWin(board);
          }

          // Check if a conclusion has been made
          if (win === "bw" || win === "rw") {
            await removePlayers(win === "bw" ? "p" : "o");
          } else if (win === "t") {
            await removePlayers("t");
          }

          // Finish update
          await msg.edit(draw());
          await i.deferUpdate();
        });
      },
    });
  },
};

export default command;

// Stolen from ChatGPT
function checkWin(board: State[][]): "-" | "rw" | "bw" {
  const height = board.length;
  const width = board[0].length;

  function replaceWinningRow(
    startX: number,
    startY: number,
    deltaX: number,
    deltaY: number,
    winner: State
  ) {
    for (let i = 0; i < 4; i++) {
      const x = startX + i * deltaX;
      const y = startY + i * deltaY;
      board[y][x] = winner === "r" ? "rw" : "bw";
    }
  }

  function checkDirection(
    startX: number,
    startY: number,
    deltaX: number,
    deltaY: number
  ) {
    const player = board[startY][startX];
    if (player === "-" || player === "rw" || player === "bw") return false;

    for (let i = 1; i < 4; i++) {
      const x = startX + i * deltaX;
      const y = startY + i * deltaY;
      if (
        x < 0 ||
        x >= width ||
        y < 0 ||
        y >= height ||
        board[y][x] !== player
      ) {
        return false;
      }
    }
    replaceWinningRow(startX, startY, deltaX, deltaY, player);
    return player;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (checkDirection(x, y, 1, 0)) return board[y][x] as "rw" | "bw"; // Horizontal
      if (checkDirection(x, y, 0, 1)) return board[y][x] as "rw" | "bw"; // Vertical
      if (checkDirection(x, y, 1, 1)) return board[y][x] as "rw" | "bw"; // Diagonal /
      if (checkDirection(x, y, 1, -1)) return board[y][x] as "rw" | "bw"; // Diagonal \
    }
  }

  return "-";
}
