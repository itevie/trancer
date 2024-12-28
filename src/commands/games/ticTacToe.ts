import {
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
import config from "../../config";
import wrapGame from "../../util/GameWrapper";
import { client } from "../..";
import { currency } from "../../util/textProducer";

type State = "o" | "x" | "-";

const command: HypnoCommand<{ user: User; bet?: number }> = {
  name: "tictactoe",
  type: "games",
  aliases: ["ttt"],
  description: "Play TicTacToe",

  args: {
    requiredArguments: 0,
    args: [
      {
        type: "user",
        name: "user",
      },
      {
        type: "wholepositivenumber",
        name: "bet",
        description: "Bet an amount of money",
      },
    ],
  },

  handler: async (message, { args }) => {
    await wrapGame({
      title: "TicTacToe",
      databasePrefix: "ttt",
      opponent: args.user,
      bet: args.bet,
      message,
      timeout: 1000 * 60 * 1,
      allowAi: true,
      callback: async ({
        opponent,
        player,
        message,
        collector,
        removePlayers,
        setTurn,
      }) => {
        const game: State[] = [, , , , , , , , ,].fill("-");
        let winner: State | "t" = "-";
        let forceCancel = false;
        let current = Math.random() > 0.5 ? opponent : player;
        if (opponent.id === client.user.id) current = player;
        let isForfeit = false;

        function generateButton(idx: number): ButtonBuilder {
          return new ButtonBuilder()
            .setCustomId(`ttt-play-${idx}`)
            .setLabel(game[idx])
            .setDisabled(game[idx] !== "-" || winner !== "-" || forceCancel)
            .setStyle(
              game[idx] === "x"
                ? ButtonStyle.Primary
                : game[idx] === "o"
                ? ButtonStyle.Danger
                : ButtonStyle.Secondary
            );
        }

        function createMessage(): MessageReplyOptions & MessageEditOptions {
          let components: ActionRowBuilder[] = [
            // @ts-ignore
            new ActionRowBuilder().addComponents(
              generateButton(0),
              generateButton(1),
              generateButton(2)
            ),
            // @ts-ignore
            new ActionRowBuilder().addComponents(
              generateButton(3),
              generateButton(4),
              generateButton(5)
            ),
            // @ts-ignore
            new ActionRowBuilder().addComponents(
              generateButton(6),
              generateButton(7),
              generateButton(8)
            ),
          ];

          if (winner === "-" && !forceCancel) {
            components.push(
              // @ts-ignore
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId("ttt-forfeit")
                  .setLabel("Forfeit")
              )
            );
          }

          // Create message
          let message: string = "";

          // Game was force cancelled
          if (forceCancel) message = "The game was cancelled";
          // Game was a tie
          else if (winner === "t")
            message = `The game was a tie!${
              args.bet ? "\nYou both keep your money." : ""
            }`;
          // Game is ongoing
          else if (winner === "-")
            message = `**${current.username}** to play.\nForfeiting makes the other player win.`;
          // Game has a winner
          else if (winner === "o" || winner === "x")
            message = `**${
              winner === "x" ? player.username : opponent.username
            }** won the game!${isForfeit ? " (forfeit)" : ""}\n${
              args.bet ? `You won ${currency(args.bet)}!` : ""
            }`;

          return {
            embeds: [
              createEmbed().setTitle("TicTacToe").setDescription(message),
            ],
            // @ts-ignore
            components,
          };
        }

        let msg = await message.edit(createMessage());

        async function setWinner(win: State | "t") {
          winner = win;

          await msg.edit(createMessage());
          await removePlayers(
            winner === "t" ? "t" : winner === "x" ? "p" : "o"
          );
        }

        collector.on("collect", async (i) => {
          // Check for forfeit
          if (i.customId === "ttt-forfeit") {
            isForfeit = true;
            await setWinner(i.user.id === player.id ? "o" : "x");
            await i.deferUpdate();
            return;
          }

          // Validate for playing
          if (!i.customId.startsWith("ttt-play")) return;
          if (current !== i.user)
            return await i.reply({
              content: "It is not your turn",
              ephemeral: true,
            });

          // Get index
          let idx = parseInt(i.customId.split("ttt-play-")[1]);
          if (game[idx] !== "-") return;

          // Update details
          game[idx] = current === player ? "x" : "o";
          current = current === player ? opponent : player;
          setTurn(current.id === player.id ? "p" : "o");
          await i.deferUpdate();
          await msg.edit(createMessage());

          const win = checkWin(game);

          // There is a winner
          if (win !== "-") {
            await setWinner(win);
            return;
          }

          // It is a tie
          if (game.every((x) => x !== "-")) {
            await setWinner("t");
            return;
          }

          if (current.id === client.user.id) {
            let turn = aiMove(game, current === player ? "x" : "o", "o");
            game[turn] = "o";
            await msg.edit(createMessage());

            const win = checkWin(game);

            // There is a winner
            if (win !== "-") {
              await setWinner(win);
              return;
            }

            // It is a tie
            if (game.every((x) => x !== "-")) {
              await setWinner("t");
              return;
            }

            current = player;
          }
        });
      },
    });
  },
};

export default command;

function checkWin(game: State[]): State {
  // Check win
  const winningCombinations = [
    // Horizontal rows
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    // Vertical columns
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    // Diagonals
    [0, 4, 8],
    [2, 4, 6],
  ];

  let win: State = "-";

  for (const [a, b, c] of winningCombinations) {
    if (game[a] === game[b] && game[a] === game[c] && game[a] !== "-") {
      win = game[a];
      break;
    }
  }

  return win;
}

// -1 = lose, 0 = tie, 1 = win
function aiMove(board: State[], turn: "x" | "o", aiPlayer: "x" | "o"): number {
  const indexes = _aiMove(board, turn, aiPlayer, true);

  const averaged: { [key: string]: number } = {};
  for (const [key, states] of Object.entries(indexes)) {
    const sum = states
      .map((x) => (x === "-" ? 0 : x === aiPlayer ? 1 : -1) * states.length)
      .reduce((p, c) => p + c, 0);
    averaged[key] = sum / states.length;
  }

  let best: [number, number] = [-Infinity, -Infinity];

  for (const [k, v] of Object.entries(averaged))
    if (v > best[1]) best = [parseInt(k), v];

  return best[0];
}

function _aiMove(
  board: State[],
  turn: "x" | "o",
  aiPlayer: "x" | "o",
  _isBase: boolean = false
): { [key: string]: State[] } {
  let freeIndexes = [...board]
    .map((k, v) => (k === "-" ? v : null))
    .filter((x) => x !== null);

  const indexes: { [key: string]: State[] } = {};

  for (const index of freeIndexes) {
    let tempBoard = [...board];
    tempBoard[index] = turn;

    let win = checkWin(tempBoard);
    // console.log(_isBase, tempBoard.join(""), index, turn, win);

    // Win = return early
    // Tie = recurse
    // Lose = return early

    if (win !== "-") {
      indexes[index] = [...(index[index] || []), win];
      continue;
    }

    let nextIter = _aiMove(
      tempBoard,
      turn === "x" ? "o" : "x",
      aiPlayer,
      false
    );

    for (const [k, v] of Object.entries(nextIter)) {
      indexes[k] = [...(indexes[k] || []), ...v];
    }
  }

  return indexes;
}
