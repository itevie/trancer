import { ActionRowBuilder, ButtonBuilder, ButtonStyle, User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";
import { currency } from "../../util/language";
import wrapGame from "./_util";

export const existingGames: { [key: string]: string } = {};

const command: HypnoCommand<{ user: User; amount?: number }> = {
  name: "rockpaperscissors",
  aliases: ["rps"],
  description: "Play Rock Paper Scissors with another player",
  type: "games",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "user",
        type: "user",
      },
      {
        name: "amount",
        type: "currency",
      },
    ],
  },

  handler: async (message, { args }) => {
    wrapGame({
      message,
      bet: args.amount,
      opponent: args.user,
      title: `Rock Paper Scissors`,
      async callback(op) {
        await op.message.edit({
          components: [
            // @ts-ignore
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("r")
                .setEmoji("🪨")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("p")
                .setEmoji("📄")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("s")
                .setEmoji("✂️")
                .setStyle(ButtonStyle.Primary)
            ),
          ],
          embeds: [
            createEmbed()
              .setTitle("Rock Paper Scissors")
              .setDescription(
                `${op.player.username}, ${op.opponent.username} please select rock paper or scissors!`
              ),
          ],
        });

        type Play = "r" | "p" | "s";
        let player: Play | null = null;
        let opponent: Play | null = null;

        const collector = op.message.createMessageComponentCollector({
          filter: (i) =>
            i.user.id === op.player.id || i.user.id === op.opponent.id,
          time: 1000 * 30,
        });

        collector.on("collect", async (i) => {
          if (i.user.id === op.player.id) {
            if (player !== null)
              await i.reply({
                flags: ["Ephemeral"],
                content: "You have already selected your choice!",
              });
            else {
              player = i.customId as Play;
              await i.reply({
                flags: ["Ephemeral"],
                content:
                  "You have selected your choice - wait for the other person!",
              });
            }
          } else {
            if (opponent !== null)
              await i.reply({
                flags: ["Ephemeral"],
                content: "You have already selected your choice!",
              });
            else {
              opponent = i.customId as Play;
              await i.reply({
                flags: ["Ephemeral"],
                content:
                  "You have selected your choice - wait for the other person!",
              });
            }
          }

          if (player !== null && opponent !== null) {
            let win: "p" | "o" | "t" | null = null;
            if (player === opponent) {
              win = "t";
            } else if (
              (player === "r" && opponent === "s") ||
              (player === "p" && opponent === "r") ||
              (player === "s" && opponent === "p")
            ) {
              win = "p";
            } else {
              win = "o";
            }

            await op.removePlayers(win);
            await op.message.edit({
              components: [],
              embeds: [
                createEmbed()
                  .setTitle("Rock Paper Scissors")
                  .setDescription(
                    {
                      p: `**${op.player.username}** won${
                        args.amount ? ` ${currency(args.amount)}` : ""
                      }!`,

                      o: `**${op.opponent.username}** won${
                        args.amount ? ` ${currency(args.amount)}` : ""
                      }!`,
                      t: "It was a tie!",
                    }[win]
                  ),
              ],
            });
          }
        });

        collector.on("end", (_, reason) => {
          if (reason === "time")
            op.message.edit({
              components: [],
              embeds: [
                createEmbed()
                  .setTitle("Rock Paper Scissors")
                  .setDescription(
                    "You guys took too long! It's just a button </3"
                  ),
              ],
            });
        });
      },
    });
  },
};
export default command;
