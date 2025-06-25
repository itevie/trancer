import { User } from "discord.js";
import { client } from "..";
import StateConfig from "../models/StateConfig";
import { actions } from "../util/database";
import { units } from "../util/ms";
import { createEmbed } from "../util/other";
import { Timer } from "./timer";
import config from "../config";

const timer: Timer = {
  name: "qotd",
  every: units.minute * 10,
  noDev: true,
  async execute() {
    let time = (await StateConfig.fetch()).lastQotd;
    if (
      1000 * 60 * 60 * 24 - (Date.now() - time.getTime()) < 0 &&
      new Date().getHours() === config.qotd.hour
    ) {
      const allQuestions = await actions.qotd.getQuestions(config.botServer.id);
      const filteredQuestions = allQuestions.filter((x) => !x.asked);
      if (filteredQuestions.length === 0) return;

      const question =
        filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
      await actions.qotd.setAsked(question.id, true);
      const remaining = filteredQuestions.length;

      let author: User | null = null;
      try {
        author = await client.users.fetch(question.suggestor);
      } catch {}

      const embed = createEmbed()
        .setTitle(":cyclone: Question of the day :cyclone:")
        .setDescription(question.question)
        .setFooter({
          text: `${author ? `Author: ${author.username} ` : ""}ID: ${
            question.id
          } Remaining: ${remaining}`,
        });

      const channel = await client.channels.fetch(config.qotd.channel);
      if (channel.isTextBased()) {
        await channel.send({
          content: config.qotd.content,
          embeds: [embed],
        });
      }
    }
  },
};

export default timer;
