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
import {
  addMoneyFor,
  getEconomyFor,
  removeMoneyFor,
} from "../../util/actions/economy";
import config from "../../config";

type State = "o" | "x" | "-";

const set = new Map<string, Message>();

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
    if (message.author.id === args.user.id)
      return message.reply(
        `You cannot play TicTacToe against yourself, silly.`
      );
    if (args.user.bot)
      return message.reply(`You cannot play TicTacToe against a bot, silly.`);

    if (set.has(message.author.id)) {
      let place = set.get(message.author.id);
      return message.reply(
        `You are already in a game!\nhttps://discord.com/channels/${place.guildId}/${place.channelId}/${place.id}`
      );
    }
    if (set.has(args.user.id)) {
      let place = set.get(args.user.id);
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

    const game: State[] = [, , , , , , , , ,].fill("-");
    let winner: State | "t" = "-";
    let forceCancel = false;
    let current = Math.random() > 0.5 ? args.user : message.author;
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

    function createMessage(): MessageReplyOptions {
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
              .setCustomId("ttt-end")
              .setLabel("Forfeit")
          )
        );
      }

      return {
        embeds: [
          createEmbed()
            .setTitle("TicTacToe")
            .setDescription(
              forceCancel
                ? "The game was cancelled."
                : winner === "t"
                ? `The game was a tie!${
                    args.bet ? "\nYou both keep your money." : ""
                  }`
                : winner === "-"
                ? `**${current.username}** to play.${
                    args.bet
                      ? `Note: forfeiting makes the other player win.`
                      : ""
                  }`
                : `**${
                    winner === "x"
                      ? message.author.username
                      : args.user.username
                  }** won the game!${isForfeit ? ` (forfeit)` : ""}\n${
                    args.bet
                      ? `You won **${args.bet}${config.economy.currency}**!`
                      : ""
                  }`
            ),
        ],
        // @ts-ignore
        components,
      };
    }

    let msg = await message.reply({
      content: `<@${args.user.id}>`,
      embeds: [
        createEmbed()
          .setTitle("TicTacToe")
          .setDescription(
            `**${args.user.username}**, **${
              message.author.username
            }** has invited you to a game of TicTacToe${
              args.bet
                ? ` with a bet of **${args.bet}**${config.economy.currency}`
                : ""
            }!\nClick the buttons below to react.`
          ),
      ],
      components: [
        //@ts-ignore
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ttt-start")
            .setStyle(ButtonStyle.Success)
            .setLabel("Play"),
          new ButtonBuilder()
            .setCustomId("ttt-reject")
            .setStyle(ButtonStyle.Danger)
            .setLabel("Reject")
        ),
      ],
    });

    set.set(message.author.id, msg);
    set.set(args.user.id, msg);

    //let msg = await message.reply(createMessage());
    let collector = msg.createMessageComponentCollector({
      filter: (x) =>
        x.user.id === message.author.id || x.user.id === args.user.id,
    });

    collector.on("collect", async (i) => {
      async function setWinner(win: State) {
        winner = win;
        await msg.edit(createMessage() as MessageEditOptions);
        if (args.bet) {
          await addMoneyFor(
            winner === "x" ? message.author.id : args.user.id,
            args.bet,
            "gambling"
          );
          await removeMoneyFor(
            winner === "x" ? args.user.id : message.author.id,
            args.bet,
            true
          );
        }
      }

      if (i.customId === "ttt-start" && i.user.id !== args.user.id) {
        return i.reply({
          content: `You cannot start the game because you are the creator! Wait for the opponent to accept, or click "Reject"`,
          ephemeral: true,
        });
      }

      if (i.customId === "ttt-start") {
        await msg.edit(createMessage() as MessageEditOptions);
        await i.deferUpdate();
        return;
      }

      if (i.customId === "ttt-reject") {
        collector.stop();
        set.delete(message.author.id);
        set.delete(args.user.id);
        await msg.edit({
          content: `The game was cancelled!`,
          embeds: [],
          components: [],
        });
        await i.deferUpdate();
        return;
      }

      if (i.customId === "ttt-end") {
        collector.stop();
        set.delete(message.author.id);
        set.delete(args.user.id);
        isForfeit = true;
        setWinner(i.user.id === message.author.id ? "o" : "x");
        await i.deferUpdate();
        return;
      }

      // Validate
      if (!i.customId.startsWith("ttt-play")) return;
      if (current !== i.user)
        return i.reply({
          content: "It is not your turn.",
          ephemeral: true,
        });

      // Get index
      let idx = parseInt(i.customId.split("ttt-play-")[1]);
      if (game[idx] !== "-") return;

      // Update
      game[idx] = current === message.author ? "x" : "o";
      current = current === message.author ? args.user : message.author;
      await i.deferUpdate();
      await msg.edit(createMessage() as MessageEditOptions);

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

      if (win !== "-") {
        setWinner(win);
        collector.stop();
        set.delete(message.author.id);
        set.delete(args.user.id);
        return;
      }

      if (game.every((x) => x !== "-")) {
        winner = "t";
        await msg.edit(createMessage() as MessageEditOptions);
        collector.stop();
        set.delete(message.author.id);
        set.delete(args.user.id);
        return;
      }
    });
  },
};

export default command;
