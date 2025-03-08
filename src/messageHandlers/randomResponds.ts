import { Jimp } from "jimp";
import { HypnoMessageHandler } from "../types/util";
import { getRandomImposition } from "../util/other";
import { readFileSync } from "fs";
import { AttachmentBuilder } from "discord.js";
import { generateNotImmuneImage } from "../commands/fun/_image_util";

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
    if (message.content.match(/(i'?m)? ?(not?) a? ?fishy?/gi)) {
      message.reply(
        `${
          msgs[Math.floor(Math.random() * msgs.length)]
        } ${await getRandomImposition(message.author.id)}`
      );
    }
    if (message.content.match(/(kys)|(kill ?y?o?urself)|(fu?ck ?y?o?u)/i))
      return message.reply(`Hey, that's not very nice! *patpatpat*`);
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
  },
};

export default handler;
