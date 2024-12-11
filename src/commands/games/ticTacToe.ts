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

type State = "o" | "x" | "-";

const command: HypnoCommand<{ user: User; bet?: number }> = {
  name: "tictactoe",
  type: "games",
  aliases: ["ttt"],
  description: "Play TicTacToe",

  args: {
    requiredArguments: 1,
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
      callback: async ({
        opponent,
        player,
        message,
        collector,
        removePlayers,
      }) => {
        const game: State[] = [, , , , , , , , ,].fill("-");
        let winner: State | "t" = "-";
        let forceCancel = false;
        let current = Math.random() > 0.5 ? opponent : player;
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
              args.bet
                ? `You won **${args.bet}${config.economy.currency}**!`
                : ""
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
          await i.deferUpdate();
          await msg.edit(createMessage());

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

          // There is a winner
          if (win !== "-") {
            await setWinner(win);
          }

          // It is a tie
          if (game.every((x) => x !== "-")) {
            await setWinner("t");
          }
        });
      },
    });
  },
};

export default command;
