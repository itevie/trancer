import { existsSync, readFileSync, writeFileSync } from "fs";
import config from "../config";
import { actions } from "./database";
import { createEmbed } from "./other";
import { client } from "..";
import { User } from "discord.js";

const dateFile = config.dataDirectory + "/qotd.txt";

export function initQotd() {
  if (client.user.id === config.devBot.id) return;
  if (!existsSync(dateFile)) writeFileSync(dateFile, new Date(0).toISOString());
  checkQotd();
  setInterval(checkQotd, 1000 * 60);
}

async function checkQotd() {
  let time = new Date(readFileSync(dateFile, "utf-8"));
  if (
    1000 * 60 * 60 * 24 - (Date.now() - time.getTime()) < 0 &&
    new Date().getHours() === config.qotd.hour
  ) {
    writeFileSync(dateFile, new Date().toISOString());
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
}
