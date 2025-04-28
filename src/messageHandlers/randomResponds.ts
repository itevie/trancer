import { Jimp } from "jimp";
import { HypnoMessageHandler } from "../types/util";
import { getRandomImposition } from "../util/other";
import { readFileSync } from "fs";
import { AttachmentBuilder } from "discord.js";
import { generateNotImmuneImage } from "../commands/fun/_image_util";
import { client } from "..";

const fishMessages = [
  "blub",
  "blub blub blub",
  "you're a fish",
  "fish fr",
  'pfft "not a fish"',
];

const hateMessages = [
  "wtf did i do to you man",
  "Hey don't hate me :( I'm trying my best, ok?",
  "as if you're any better",
  "ok... i'll leave i guess... *tears up*",
  "love u too",
  "fuck you",
  "well you're not so cool yourself",
  "yeah i hate you too",
  "ok?",
];

const loveMessages = [
  "Aw, I love you too :blue_heart:",
  "Thanks, I try my best <3",
  "Thanks a lot, I love you too :)",
  "Thanks, it's appreciated!",
  "mwah!",
];

const handler: HypnoMessageHandler = {
  name: "random-responder",
  description: "Reacts to certain messages with random responses",
  examples: [
    `"I'm not a fish": responds with a random piece of impo`,
    `"kys" or "fuck you": Hey, that's not very nice! *patpatpat*`,
    `"I'm immune": responds with random bit of impo + a gif`,
  ],

  handler: async (message, { serverSettings }) => {
    if (!serverSettings.random_replies) return;

    // Don't hang me, Fin
    if (
      message.author.id === "772511780680499252" &&
      ["hang", "execute", "kill", "crucify"].some((x) =>
        message.content.toLowerCase().includes(x),
      ) &&
      ["him", "trancer"].some((x) => message.content.toLowerCase().includes(x))
    )
      return message.reply(`No... Fin... pls don't hang me :(`);

    if (
      message.author.id === "916688777752240170" &&
      message.content
        .toLowerCase()
        .match(
          /(i ? don'?t ?think i'?m ?gay)|(i'?m ?not ?gay)|(i ?don'?t ?think i'?m ?gay)/i,
        )
    ) {
      // Sheerseeker is gay
      let parts = [
        "yes you are gay",
        "haha ur gay",
        "you literally are gay tho",
        "yeah sure ok",
        "yeah sure ok whatever you say",
      ];
      return message.reply(parts[Math.floor(Math.random() * parts.length)]);
    }

    // "I'm not a fish"
    if (message.content.match(/(i'?m)? ?(not?) a? ?fishy?/gi)) {
      return message.reply(
        `${
          fishMessages[Math.floor(Math.random() * fishMessages.length)]
        } ${await getRandomImposition(message.author.id)}`,
      );
    }

    // "kys" / "fuck you"
    if (message.content.match(/(kys)|(kill ?y?o?urself)|(fu?ck ?y?o?u)/i))
      return message.reply(`Hey, that's not very nice! *patpatpat*`);

    // "I'm immune"
    if (message.content.match(/i'?m ?im?mune/i)) {
      let impo = await getRandomImposition(message.author.id);
      return message.reply({
        content: impo,
        files: [
          new AttachmentBuilder(
            await generateNotImmuneImage(
              message.author.displayAvatarURL({
                forceStatic: true,
                extension: "png",
              }),
            ),
          ).setName("YOURE_NOT_IMMUNE.png"),
        ],
      });
    }

    // Check if Trancer is a subject
    if (
      (message.reference &&
        (await message.fetchReference()).author.id === client.user.id) ||
      message.content.includes(client.user.id)
    ) {
      if (message.content.match(/i? ?love y?oa??u/i)) {
        return message.reply({
          content:
            loveMessages[Math.floor(Math.random() * loveMessages.length)],
        });
      }

      if (message.content.match(/(i hate y?o?u)|(die)|(kys)/i)) {
        return message.reply({
          content:
            hateMessages[Math.floor(Math.random() * hateMessages.length)],
        });
      }
    }
  },
};

export default handler;
