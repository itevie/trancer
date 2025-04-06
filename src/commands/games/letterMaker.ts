import { readFileSync } from "fs";
import { HypnoCommand } from "../../types/util";

import { createEmbed, randomFromRange } from "../../util/other";
import ecoConfig from "../../ecoConfig";
import { currency } from "../../util/language";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { actions } from "../../util/database";
export const words = new Set(
  readFileSync(__dirname + "/../../data/words.txt", "utf8")
    .split("\n")
    .map((word) => word.trim()),
);
const sortedWords = Array.from(words).sort((a, b) => a.length - b.length);

const modes = {
  easy: {
    letters: "abcdefghijklmnoprstu",
    min: 1,
    max: 3,
    period: 30000,
  },
  normal: {
    letters: "abcdefghijklmnoprstuvyz",
    min: 2,
    max: 4,
    period: 20000,
  },
  hard: {
    letters: "abcdefghijklmnopqrstuvwxyz",
    min: 3,
    max: 5,
    period: 15000,
  },
  soft: {
    letters: "abcdefghijklmnopqrstuvwxyz",
    min: 1,
    max: 10,
    period: 5000,
  },
} as const;

const wordsUsed = new Map<string, string[]>();

const command: HypnoCommand<{ mode?: keyof typeof modes }> = {
  name: "lettermaker",
  aliases: ["lm", "im", "wordmaker", "wm"],
  description:
    "You are given some letters and must provide a word with all of them in it!",
  type: "games",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "mode",
        type: "string",
        oneOf: Object.keys(modes),
      },
    ],
  },

  handler: async (message, { args }) => {
    const modeName = args.mode ?? "easy";
    const mode = modes[modeName];
    const vowels = "aeiou";
    const consonants = mode.letters.replace(/[aeiou]/g, "");

    const requiredLetters: string[] = [];
    const addLetter = () => {
      requiredLetters.push(
        Math.random() < 0.6
          ? vowels[Math.floor(Math.random() * vowels.length)]
          : consonants[Math.floor(Math.random() * consonants.length)],
      );
    };

    for (let i = 0; i < mode.min; i++) {
      addLetter();
    }

    for (let i = 0; i < mode.max && requiredLetters.length < mode.max; i++) {
      if (Math.random() > 0.8) {
        addLetter();
      }
    }

    const msg = await message.reply({
      embeds: [
        createEmbed()
          .setTitle("Make The Word!")
          .setDescription(
            `Make a word with the following letters:\n\n**${requiredLetters
              .join(" ")
              .toUpperCase()}**\n\nYou have **${
              mode.period / 1000
            } seconds** to make a word!`,
          ),
      ],
      components: [
        // @ts-ignore
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("give-up")
            .setLabel("Give Up")
            .setStyle(ButtonStyle.Danger),
        ),
      ],
    });

    const collector = msg.channel.createMessageCollector({
      time: mode.period,
    });

    const interactionCollector = msg.createMessageComponentCollector({
      time: mode.period,
    });

    interactionCollector.on("collect", async (interaction) => {
      if (interaction.customId === "give-up") {
        collector.stop("time");
        interactionCollector.stop();
        await interaction.deferUpdate();
      }
    });

    function check(word: string, letters: string[]): boolean {
      const neededLetters = [...letters];
      if (!words.has(word)) return false;
      for (const [k, v] of neededLetters.entries()) {
        if (word.includes(v)) {
          word = word.replace(v, "");
          neededLetters[k] = null;
        }
      }

      return !neededLetters.some((x) => x !== null);
    }

    function makeExamples(): string[] {
      let examples: string[] = [];
      for (const word of sortedWords) {
        if (check(word, requiredLetters)) {
          examples.push(word);
          if (examples.length >= 15) break;
        }
      }

      return examples;
    }

    collector.on("collect", async (m) => {
      if (!wordsUsed.has(message.author.id)) wordsUsed.set(m.author.id, []);
      let word = m.content.toLowerCase();
      let array = wordsUsed.get(m.author.id);
      if (words.has(word)) {
        if (array.includes(word)) {
          return await m.reply({
            content: "You already used that word - be more original.",
          });
        }
      }

      if (m.content && !check(m.content.toLowerCase(), requiredLetters)) return;
      array.push(word);
      let reward =
        randomFromRange(
          ecoConfig.payouts.letterMaker.min,
          ecoConfig.payouts.letterMaker.max,
        ) * requiredLetters.length;

      if (modeName === "easy") reward = 0;

      await msg.edit({
        embeds: [
          createEmbed()
            .setTitle("Make The Word")
            .setDescription(
              `Welldone! **${m.author.username}** made the word **${
                m.content
              }**! You got ${currency(
                reward,
              )}\n\nThe required letters were: **${requiredLetters
                .join(" ")
                .toUpperCase()}**`,
            ),
        ],
        components: [],
      });
      await actions.eco.addMoneyFor(m.author.id, reward);
      await m.react("✅");
      collector.stop();
    });

    collector.on("end", async (_, reason) => {
      const examples = makeExamples();

      if (reason === "time") {
        await msg.edit({
          embeds: [
            createEmbed()
              .setTitle("Make The Word")
              .setDescription(
                `Time's up! No one made a word!\n\nThe required letters were:\n\n **${requiredLetters
                  .join(" ")
                  .toUpperCase()}**${
                  examples.length !== 0
                    ? "\n\nHere are some examples of words you could have made:\n\n" +
                      examples.map((x) => `**${x}**`).join(", ")
                    : ""
                }`,
              ),
          ],
          components: [],
        });
      }
    });
  },
};

export default command;
