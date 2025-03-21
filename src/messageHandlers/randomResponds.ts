import { Jimp } from "jimp";
import { HypnoMessageHandler } from "../types/util";
import { getRandomImposition } from "../util/other";
import { readFileSync } from "fs";
import { AttachmentBuilder } from "discord.js";
import { generateNotImmuneImage } from "../commands/fun/_image_util";
import { client } from "..";

const msgs = [
  "blub",
  "blub blub blub",
  "you're a fish",
  "fish fr",
  'pfft "not a fish"',
];

const handler: HypnoMessageHandler = {
  name: "random-responder",
  description: "Reacts to certain messages with random responses",

  handler: async (message) => {
    // "I'm not a fish"
    if (message.content.match(/(i'?m)? ?(not?) a? ?fishy?/gi)) {
      return message.reply(
        `${
          msgs[Math.floor(Math.random() * msgs.length)]
        } ${await getRandomImposition(message.author.id)}`
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
              })
            )
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
      if (message.content.match(/i love y?o?u/i)) {
        return message.reply({
          content: "Aw, I love you too :blue_heart:",
        });
      }

      if (message.content.match(/i hate y?o?u/i)) {
        return message.reply({
          content: "Hey don't hate me :( I'm trying my best, ok?",
        });
      }
    }
  },
};

export default handler;
