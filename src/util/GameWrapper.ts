import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  InteractionCollector,
  MappedInteractionTypes,
  Message,
  User,
} from "discord.js";
import { addMoneyFor, getEconomyFor, removeMoneyFor } from "./actions/economy";
import config from "../config";
import { createEmbed } from "./other";
import { database } from "./database";

interface GameWrapperOptions {
  callback: (op: {
    message: Message;
    removePlayers: (winner?: "p" | "o" | "t" | null) => Promise<void>;
    opponent: User;
    player: User;
    collector: ReturnType<Message["createMessageComponentCollector"]>;
    setTurn: (turn: "p" | "o") => void;
  }) => any;
  message: Message;
  opponent: User;
  bet?: number;
  databasePrefix?: string;
  title: string;
  timeout: number;
  extra?: string;
}

const inGames: Map<string, Message> = new Map();

export default async function wrapGame(options: GameWrapperOptions) {
  let player = options.message.author;
  let opponent = options.opponent;

  // Check if trying to play against self
  if (opponent.id === player.id)
    return await options.message.reply(
      "You can't play against yourself, silly!"
    );

  // Check bot
  if (opponent.bot)
    return await options.message.reply("You can't play against a bot, silly!");

  // Check if one of the user's is already in a game
  if (inGames.has(player.id)) {
    let place = inGames.get(player.id);
    return await options.message.reply(
      `You are already in a game!\nhttps://discord.com/channels/${place.guildId}/${place.channelId}/${place.id}`
    );
  } else if (inGames.has(opponent.id)) {
    let place = inGames.get(opponent.id);
    return await options.message.reply(
      `They are already in a game!\nhttps://discord.com/channels/${place.guildId}/${place.channelId}/${place.id}`
    );
  }

  // Check bets
  if (options.bet) {
    let bet = options.bet;
    let pEco = await getEconomyFor(player.id);
    let oEco = await getEconomyFor(opponent.id);
    if (pEco.balance < options.bet)
      return await options.message.reply(
        `You do not have **${bet}**${config.economy.currency} to bet!`
      );
    if (oEco.balance < bet)
      return await options.message.reply(
        `They do not have **${bet}**${config.economy.currency} to bet!`
      );
  }

  // Create invitation message
  let message = await options.message.reply({
    embeds: [
      createEmbed()
        .setTitle(options.title)
        .setDescription(
          `**${opponent.username}**, **${
            player.username
          }** has invited you to a game of ${options.title}${
            options.bet
              ? ` with a bet of **${options.bet}${config.economy.currency}**`
              : ""
          }!${
            options.extra ? `\n${options.extra}` : ""
          }\nClick the buttons below to react.\n\nThis game has a turn timeout of **${
            options.timeout / 60000
          }** minutes.`
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

  // Add the players to inGames
  inGames.set(player.id, message);
  inGames.set(opponent.id, message);

  // Create collector
  let collector = message.createMessageComponentCollector({
    filter: (i) => [player.id, opponent.id].includes(i.user.id),
    time: 1000 * 60,
  });

  collector.on("collect", async (i) => {
    if (i.customId === "game-start") {
      if (i.user.id === player.id)
        return await i.reply({
          content: `You cannot start the game because you are the creator! Wait for the opponent to accept, or click "Reject"`,
          ephemeral: true,
        });

      collector.stop();
      await i.deferUpdate();

      let gameCollector = message.createMessageComponentCollector({
        filter: (i) => [player.id, opponent.id].includes(i.user.id),
      });

      let currentTurn: "p" | "o" | "-" = "-";

      let startTimeout = Date.now();
      let timeout = setTimeout(() => {
        if (!gameCollector.ended) gameCollector.stop("time");
      }, options.timeout);

      let interval = setInterval(async () => {
        if (options.timeout - (Date.now() - startTimeout) < 30000) {
          await message.edit({
            content: `**${
              currentTurn === "p" ? player.username : opponent.username
            }**, ${Math.floor(
              (options.timeout - (Date.now() - startTimeout)) / 1000
            )} seconds left.`,
          });
        }
      }, 5000);

      gameCollector.on("end", async (_, reason) => {
        clearInterval(interval);
        if (reason === "time") {
          await removePlayers(currentTurn === "p" ? "o" : "p");
          await message.edit({
            content: `**Timeout**: This game is no longer active.\n**${
              currentTurn === "p" ? opponent.username : player.username
            }** won${
              options.bet
                ? ` the **${options.bet}${config.economy.currency}**`
                : ""
            }!`,
          });
        }
      });

      async function removePlayers(winner: "p" | "o" | "t") {
        // Remove players
        inGames.delete(player.id);
        inGames.delete(opponent.id);

        gameCollector.stop();

        // Check if there was a bet
        if (options.bet && winner !== "t") {
          await addMoneyFor(
            winner === "p" ? player.id : opponent.id,
            options.bet,
            "gambling"
          );
          await removeMoneyFor(
            winner === "o" ? player.id : opponent.id,
            options.bet,
            true
          );
        }

        // Check if there is database statistics
        if (options.databasePrefix) {
          if (winner === "t") {
            await database.run(
              `UPDATE user_data SET ${options.databasePrefix}_tie = ${options.databasePrefix}_tie + 1 WHERE user_id IN (?, ?) AND guild_id = ?`,
              player.id,
              opponent.id,
              options.message.guild.id
            );
          } else {
            await database.run(
              `UPDATE user_data SET ${options.databasePrefix}_win = ${options.databasePrefix}_win + 1 WHERE user_id = ? AND guild_id = ?;`,
              winner === "p" ? player.id : opponent.id,
              options.message.guild.id
            );
            await database.run(
              `UPDATE user_data SET ${options.databasePrefix}_lose = ${options.databasePrefix}_lose + 1 WHERE user_id = ? AND guild_id = ?;`,
              winner === "o" ? player.id : opponent.id,
              options.message.guild.id
            );
          }
        }
      }

      options.callback({
        message,
        collector: gameCollector,
        setTurn: async (turn) => {
          // Modify data
          currentTurn = turn;
          startTimeout = Date.now();

          // Re-update timeout
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            if (!gameCollector.ended) gameCollector.stop("time");
          }, options.timeout);
        },
        removePlayers,
        opponent,
        player,
      });
    } else if (i.customId === "game-reject") {
      await i.deferUpdate();
      inGames.delete(player.id);
      inGames.delete(opponent.id);
      collector.stop();
      await message.edit({
        embeds: [
          createEmbed()
            .setTitle(options.title)
            .setDescription(`The game was rejected by **${i.user.username}**`),
        ],
        components: [],
      });
    }
  });

  // Time out message if they took too long
  collector.on("end", async (_, reason) => {
    if (reason === "time") {
      inGames.delete(player.id);
      inGames.delete(opponent.id);
      await message.edit({
        embeds: [
          createEmbed()
            .setTitle(options.title)
            .setDescription("The game invitation timed out."),
        ],
        components: [],
      });
    }
  });
}
