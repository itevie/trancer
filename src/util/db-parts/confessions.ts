import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
} from "discord.js";
import { database } from "../database";
import { createEmbed } from "../other";

const _actions = {
  get: async (id: number): Promise<Confession | undefined> => {
    return await database.get<Confession>(
      "SELECT * FROM confessions WHERE id = ?",
      id,
    );
  },

  delete: async (id: number): Promise<void> => {
    await database.run("DELETE FROM confessions WHERE id = ?", id);
  },

  create: async (content: string, author: string, channel: TextChannel) => {
    let temp = await database.get<Confession>(
      "INSERT INTO confessions (content, user_id, channel_id, message_id, created_at) VALUES (?, ?, ?, ?, ?) RETURNING *",
      content,
      author,
      channel.id,
      "%temp",
      new Date().toISOString(),
    );

    const message = await channel.send({
      embeds: [
        createEmbed()
          .setTitle(`New Anonymous Confession`)
          .setDescription(content)
          .setFooter({ text: `Confession ID: ${temp.id}` }),
      ],
      components: [
        // @ts-ignore
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setCustomId(`delete-confession-${temp.id}`)
            .setLabel("Delete"),
        ),
      ],
    });

    let newConfession = await database.get<Confession>(
      "UPDATE confessions SET message_id = ? WHERE id = ? RETURNING *",
      message.id,
      temp.id,
    );

    return newConfession;
  },
} as const;

export default _actions;
