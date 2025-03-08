import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Message,
  User,
} from "discord.js";
import { createEmbed } from "../../util/other";
import { actions, database } from "../../util/database";
import { client } from "../..";
import { currency } from "../../util/language";

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
  timeout?: number;
  extra?: string;
  allowAi?: boolean;
}

const inGames: Map<string, Message> = new Map();

export default async function wrapGame(options: GameWrapperOptions) {
  let player = options.message.author;
  let opponent = options.opponent;

  if (!opponent && options.allowAi) opponent = client.user;
  if (!opponent && !options.allowAi)
    return await options.message.reply(`Please provide a user!`);

  // Check if trying to play against self
  if (opponent.id === player.id)
    return await options.message.reply(
      "You can't play against yourself, silly!"
    );

  // Check bot
  if (opponent.bot && opponent.id !== client.user.id)
    return await options.message.reply("You can't play against a bot, silly!");

  // Check if one of the user's is already in a game
  if (inGames.has(player.id)) {
    let place = inGames.get(player.id);
    return await options.message.reply(
      `You are already in a game!\nhttps://discord.com/channels/${place.guildId}/${place.channelId}/${place.id}`
    );
  } else if (inGames.has(opponent.id) && opponent.id !== client.user.id) {
    let place = inGames.get(opponent.id);
    return await options.message.reply(
      `They are already in a game!\nhttps://discord.com/channels/${place.guildId}/${place.channelId}/${place.id}`
    );
  }

  // Check bets
  if (options.bet) {
    let bet = options.bet;
    let pEco = await actions.eco.getFor(player.id);
    let oEco = await actions.eco.getFor(opponent.id);
    if (pEco.balance < options.bet)
      return await options.message.reply(
        `You do not have ${currency(bet)} to bet!`
      );
    if (oEco.balance < bet)
      return await options.message.reply(
        `They do not have ${currency(bet)} to bet!`
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
            options.bet ? ` with a bet of ${currency(options.bet)}` : ""
          }!${
            options.extra ? `\n${options.extra}` : ""
          }\nClick the buttons below to react.${
            options.timeout
              ? `\n\nThis game has a turn timeout of **${
                  options.timeout / 60000
                }** minutes.`
              : ""
          }`
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

  if (opponent.id === client.user.id) return startGame(null);

  async function startGame(i: ChatInputCommandInteraction | null) {
    if (i?.user.id === player.id && opponent.id !== client.user.id)
      return await i.reply({
        content: `You cannot start the game because you are the creator! Wait for the opponent to accept, or click "Reject"`,
        ephemeral: true,
      });

    collector.stop();
    await (i as any)?.deferUpdate();

    let gameCollector = message.createMessageComponentCollector({
      filter: (i) => [player.id, opponent.id].includes(i.user.id),
    });

    let currentTurn: "p" | "o" | "-" = "-";

    let startTimeout = Date.now();
    setTimeout(() => {
      if (!gameCollector.ended) gameCollector.stop("time");
    }, 1000 * 60 * 30);

    let interval: ReturnType<typeof setInterval> = undefined;
    if (options.timeout) {
      interval = setInterval(async () => {
        if (options.timeout - (Date.now() - startTimeout) < 30000) {
          if (options.timeout - (Date.now() - startTimeout) < 0)
            gameCollector.stop("time");
          await message.edit({
            content: `**${
              currentTurn === "p" ? player.username : opponent.username
            }**, ${Math.floor(
              (options.timeout - (Date.now() - startTimeout)) / 1000
            )} seconds left.`,
          });
        }
      }, 5000);
    }

    gameCollector.on("end", async (_, reason) => {
      clearInterval(interval);
      if (reason === "time") {
        await removePlayers(currentTurn === "p" ? "o" : "p");
        await message.edit({
          content: `**Timeout**: This game is no longer active.\n**${
            currentTurn === "p" ? opponent.username : player.username
          }** won${options.bet ? ` the ${currency(options.bet)}` : ""}!`,
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
        await actions.eco.addMoneyFor(
          winner === "p" ? player.id : opponent.id,
          options.bet,
          "gambling"
        );
        await actions.eco.removeMoneyFor(
          winner === "o" ? player.id : opponent.id,
          options.bet,
          true
        );
      }

      // Check if there is database statistics
      if (options.databasePrefix && opponent.id !== client.user.id) {
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
      },
      removePlayers,
      opponent,
      player,
    });
  }

  collector.on("collect", async (i) => {
    if (i.customId === "game-start") {
      await startGame(i as any);
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
