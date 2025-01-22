import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  TextChannel,
  User,
} from "discord.js";
import { createEmbed } from "./other";

interface GameConfig<GameData = {}> {
  name: string;
  singleplayer: boolean;
  minimumPlayers?: boolean;
  maximumPlayers?: boolean;
  defaultGameData?: GameData;
}

export default class GameManager<GameData = {}> {
  public options: GameConfig;
  public games: GameInstance<GameData>[] = [];

  constructor(options: GameConfig) {
    this.options = options;
  }

  public async newGame(message: Message): Promise<GameInstance<GameData>> {
    if (
      this.games.findIndex((x) =>
        x.users.map((x) => x.id).includes(message.author.id)
      ) !== -1
    ) {
      const msg = await message.reply(
        `You are already in a game! Type "leave" in your next message to leave it.`
      );

      const response = await msg.channel.awaitMessages({
        max: 1,
      });

      if (response.at(0).content.toLowerCase() === "leave") {
        let game = this.games.findIndex((x) =>
          x.users.map((x) => x.id).includes(message.author.id)
        );
        this.games[game].users.splice(game, 1);
        if (this.games[game].users.length === 0) {
          this.games[game].end();
        }
      }

      return;
    }

    const game = new GameInstance<GameData>(message, this);
    game.users.push(message.author);
    game.data = (
      this.options.defaultGameData ? { ...this.options.defaultGameData } : {}
    ) as GameData;

    this.games.push(game);

    if (!this.options.singleplayer) game.sendQueue();

    return game;
  }
}

export class GameInstance<GameData = {}> {
  public users: User[] = [];
  public data: GameData = {} as GameData;
  public channel: TextChannel;
  public manager: GameManager<GameData>;
  public message: Message;
  public finished: boolean = false;

  constructor(message: Message, manager: GameManager<GameData>) {
    this.channel = message.channel as TextChannel;
    this.message = message;
    this.manager = manager;
  }

  public async end() {
    this.finished = true;
    await this.channel.send({
      embeds: [
        createEmbed()
          .setTitle(this.manager.options.name)
          .setDescription(`The game has ended!`),
      ],
    });
  }

  public async sendQueue() {
    const generateEmbed = () => {
      return createEmbed()
        .setTitle(`${this.manager.options.name}`)
        .setDescription(
          `Click the green Join button to join this game!\n\nPlayers: ${this.users
            .map((x) => x.username)
            .join(", ")}${
            this.manager.options.minimumPlayers
              ? `\nMinimum Players: ${this.manager.options.minimumPlayers}`
              : ""
          }${
            this.manager.options.maximumPlayers
              ? `\nMaximum Players: ${this.manager.options.maximumPlayers}`
              : ""
          }`
        );
    };

    const message = await this.channel.send({
      embeds: [generateEmbed()],
      components: [
        // @ts-ignore
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Join")
            .setCustomId("join")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setLabel("End")
            .setCustomId("end")
            .setStyle(ButtonStyle.Danger)
        ),
      ],
    });

    const collector = message.createMessageComponentCollector();
    collector.on("collect", async (i) => {
      if (i.customId === "join") {
        if (this.users.includes(i.user)) {
          return await i.reply({
            content: "You are already in this game!",
            ephemeral: true,
          });
        }
        this.users.push(i.user);
        await i.reply({
          content: "You joined the game!",
          ephemeral: true,
        });
      } else if (i.customId === "end") {
        if (i.user.id !== this.message.author.id)
          return await i.reply({
            content: `You cannot end this game because you didn't start it.`,
            ephemeral: true,
          });
        await i.deferUpdate();
        await message.edit({
          embeds: [
            createEmbed()
              .setTitle(this.manager.options.name)
              .setDescription("This game has ended!"),
          ],
          components: [],
        });
        this.end();
        collector.stop();
      }
    });
  }
}
