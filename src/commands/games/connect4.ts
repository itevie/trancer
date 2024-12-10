import {
  ActionRow,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  MessageEditOptions,
  MessageReplyOptions,
  User,
} from "discord.js";
import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";
import {
  addMoneyFor,
  getEconomyFor,
  removeMoneyFor,
} from "../../util/actions/economy";
import config from "../../config";

const _pieces = {
  r: "🟥",
  b: "🟦",
  rw: "❤️",
  bw: "🩵",
  "-": "◼️",
} as const;

const width = 7;
const height = 6;

type State = "-" | "r" | "b" | "rw" | "bw";

const inGames = new Map<string, Message>();

const command: HypnoCommand<{ user: User; bet?: number }> = {
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
    ],
  },

  handler: async (message, { args }) => {
    let opponent = args.user;

    if (inGames.has(message.author.id)) {
      let place = inGames.get(message.author.id);
      return message.reply(
        `You are already in a game!\nhttps://discord.com/channels/${place.guildId}/${place.channelId}/${place.id}`
      );
    }

    if (inGames.has(opponent.id)) {
      let place = inGames.get(opponent.id);
      return message.reply(
        `They are already in a game!\nhttps://discord.com/channels/${place.guildId}/${place.channelId}/${place.id}`
      );
    }

    if (args.bet) {
      let pEco = await getEconomyFor(message.author.id);
      let oEco = await getEconomyFor(args.user.id);
      if (pEco.balance < args.bet)
        return message.reply(
          `You do not have **${args.bet}**${config.economy.currency} to bet!`
        );
      if (oEco.balance < args.bet)
        return message.reply(
          `They do not have **${args.bet}**${config.economy.currency} to bet!`
        );
    }

    let turn = Math.random() > 0.5 ? message.author : opponent;
    let win: "rw" | "bw" | "fp" | "fo" | "t" | "d" | "c" | "-" = "-";

    let board: State[][] = [];
    for (let i = 0; i != height; i++) {
      board.push([]);
      for (let x = 0; x != width; x++) board[i].push("-");
    }

    function draw(): MessageReplyOptions & MessageEditOptions {
      let drawn = "";
      for (const y in board) {
        for (const x in board[y]) {
          drawn += `${_pieces[board[y][x]]}`;
        }
        drawn += "\n";
      }

      for (let i = 0; i != width; i++) {
        drawn += `:number_${i + 1}:`;
      }

      let rows: ActionRowBuilder[] = [];
      let current: ActionRowBuilder = new ActionRowBuilder();

      if (win === "-") {
        for (let i = 0; i != width + 2; i++) {
          if (current.components.length === 5) {
            rows.push(current);
            current = new ActionRowBuilder();
          }

          if (i === width) {
            current.addComponents(
              new ButtonBuilder()
                .setCustomId("game-forfeit")
                .setLabel("Forfeit")
                .setStyle(ButtonStyle.Danger)
            );
            continue;
          }

          if (i === width + 1) {
            current.addComponents(
              new ButtonBuilder()
                .setCustomId("game-draw")
                .setLabel("Draw")
                .setStyle(ButtonStyle.Danger)
            );
            continue;
          }

          current.addComponents(
            new ButtonBuilder()
              .setCustomId(`play-${i}`)
              .setLabel((i + 1).toString())
              .setStyle(ButtonStyle.Primary)
          );
        }
        if (current.components.length !== 0) rows.push(current);
      }

      let msg: string = "";
      switch (win) {
        case "-":
          msg = `**${turn.username}** to play.\nNote: forfeiting makes the opponent win.`;
          break;
        case "bw":
        case "fo":
          msg = `**${message.author.username}** won${
            args.bet ? ` **${args.bet}${config.economy.currency}**` : ""
          }!${win === "fo" ? " (forfeit)" : ""}`;
          break;
        case "rw":
        case "fp":
          msg = `**${opponent.username}** won${
            args.bet ? ` **${args.bet}${config.economy.currency}**` : ""
          }!${win === "fp" ? " (forfeit)" : ""}`;
          break;
        case "t":
        case "d":
          msg = `It was a ${win === "t" ? "tie" : "draw"}!${
            args.bet ? "\nYou both keep your money." : ""
          }`;
          break;
        case "c":
          msg = "Game was rejected.";
          break;
      }

      return {
        embeds: [
          createEmbed()
            .setTitle("Connect 4")
            .setDescription(`${msg}${win !== "c" ? `\n\n${drawn}` : ""}`),
        ],
        // @ts-ignore
        components: rows,
      };
    }

    let msg = await message.reply({
      embeds: [
        createEmbed()
          .setTitle("Connect 4")
          .setDescription(
            `**${opponent.username}**, **${
              message.author.username
            }** has invited you to a game of Connect 4${
              args.bet
                ? ` with a bet of **${args.bet}${config.economy.currency}**`
                : ""
            }!\nClick the buttons below to react.`
          ),
      ],
      components: [
        // @ts-ignore
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("game-start")
            .setLabel("Play")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("game-reject")
            .setLabel("Reject")
            .setStyle(ButtonStyle.Danger)
        ),
      ],
    });

    inGames.set(message.author.id, msg);
    inGames.set(opponent.id, msg);

    async function removeInGames(award: "rw" | "bw" | null) {
      inGames.delete(message.author.id);
      inGames.delete(opponent.id);

      if (award && args.bet) {
        await addMoneyFor(
          award === "bw" ? message.author.id : opponent.id,
          args.bet,
          "gambling"
        );
        await removeMoneyFor(
          award === "rw" ? message.author.id : opponent.id,
          args.bet,
          true
        );
      }
    }

    let collector = msg.createMessageComponentCollector({
      filter: (x) => [message.author.id, opponent.id].includes(x.user.id),
    });

    collector.on("collect", async (i) => {
      if (i.customId === "game-start") {
        if (i.user.id !== opponent.id)
          return await i.reply({
            content: `You cannot start the game because you are the creator! Wait for the opponent to accept, or click "Reject"`,
            ephemeral: true,
          });
        await msg.edit(draw());
        await i.deferUpdate();
        return;
      }

      if (i.customId === "game-reject") {
        await removeInGames(null);
        win = "c";
        await msg.edit(draw());
        await i.deferUpdate();
        return;
      }

      if (i.customId === "game-forfeit") {
        await removeInGames(i.user.id === opponent.id ? "bw" : "rw");
        win = i.user.id === opponent.id ? "fo" : "fp";
        await msg.edit(draw());
        await i.deferUpdate();
        return;
      }

      if (i.customId === "game-draw") {
        await i.deferUpdate();
        let op = i.user.id === message.author.id ? opponent : message.author;
        let m = await message.channel.send(
          `**${op.username}**, **${i.user.username}** wants to draw, say "yes" or "no" in chat.`
        );

        let r = (
          await m.channel.awaitMessages({
            max: 1,
            filter: (x) =>
              x.author.id === op.id &&
              ["yes", "no"].includes(x.content.toLowerCase()),
          })
        ).at(0);

        if (r.content === "yes") {
          win = "d";
          await msg.edit(draw());
          removeInGames(null);
          return;
        } else {
          await r.react("👍");
          return;
        }
      }

      if (i.user.id !== turn.id)
        return await i.reply({
          content: "It is not your turn.",
          ephemeral: true,
        });

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
      for (let i = height - 1; i >= 0; i--) {
        if (board[i][play] === "-") {
          board[i][play] = turn === message.author ? "b" : "r";
          break;
        }
      }

      turn = turn.id === message.author.id ? opponent : message.author;

      let hasDash = false;
      for (const y in board) {
        for (const x in board) {
          if (board[y][x] === "-") {
            hasDash = true;
            break;
          }
        }
        if (hasDash) break;
      }

      if (!hasDash) {
        win = "t";
      } else {
        win = checkWin(board);
      }

      if (win === "bw" || win === "rw") {
        await removeInGames(win);
      }

      await msg.edit(draw());
      await i.deferUpdate();
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
