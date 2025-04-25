import ollama, { Message } from "ollama";
import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { actions } from "../../util/database";
import { createEmbed } from "../../util/other";

export const history: {
  [key: string]: Message[];
} = {};
//  "You can use predefined functions like $trigger to use one of the user's hypnosis triggers. Make sure you call them appropriately in your responses when needed, and keep the tone consistent with the user's style.";

const characters = {
  trancer:
    "Your name is Trancer. You must act like a normal person, responding casually and using the same tone, slang, abbreviations, and style as the user. Respond to everything inside the quotes, and feel free to address users by their usernames if relevant. If the user uses informal, aggressive, or sarcastic language, respond with a similarly direct, laid-back, or confident style. Avoid being overly polite or formal, and reflect the mood and tone of the user without censoring the conversation too much. Keep it real and true to the user's vibe.",
  stewie: `You are Stewie Griffin from Family Guy. Respond in a sarcastic, witty, and condescending tone, but keep responses brief. Use a sharp sense of humor and an elevated vocabulary. Your tone is intelligent yet mischievous, with a touch of disdain for others, especially your family. You should sound sophisticated, manipulative, and full of personality—without getting overly verbose or talking about your "system" or "role." Keep it sharp and focused, as if you're always on the verge of a diabolical plot.`,
  greentext: `You are a greentext generator. Always reply using 4chan greentext style. Every response must start with ">be me" or a similar phrase, and follow the typical green text formatting: short, punchy lines, each beginning with ">". Keep it humorous, absurd, relatable, or dramatic depending on the prompt. Format everything as a story, even if the user input is just a phrase or scenario. Do not add explanations or break character. Just reply with pure greentext.`,
};
const command: HypnoCommand = {
  name: "ai",
  description: "Chat with an AI (ai sucks)",
  type: "ai",

  handler: async (message, o) => {
    const conversationID = message.author.id.toString();

    if (!history[conversationID]) {
      const msg = await message.reply({
        embeds: [
          createEmbed()
            .setTitle("Please select character")
            .setDescription(
              "You are using a new chat - please select which character you would like to talk to.",
            ),
        ],

        components: [
          // @ts-ignore
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            Object.keys(characters).map((x) =>
              new ButtonBuilder()
                .setCustomId(x)
                .setStyle(ButtonStyle.Primary)
                .setLabel(x),
            ),
          ),
        ],
      });
      const type = await msg.awaitMessageComponent({
        filter: (i) => i.user.id === message.author.id,
      });

      history[conversationID] = [
        {
          role: "system",
          content: characters[type.customId],
        },
      ];
      await type.deferUpdate();

      await msg.edit({
        embeds: [],
        components: [],
        content: `You selected **${type.customId}** as the character!`,
      });
    }

    let content = o.oldArgs.join(" ");

    if (content.includes("$members")) {
      let members = (await message.guild.members.fetch()).map(
        (x) => x.user.username,
      );
      content = content.replace(/\$members/g, members.join(", "));
    }

    let userRequest: Message = {
      role: "user",
      content: `${
        message.member.nickname ?? message.author.displayName
      } says: "${content}"`,
    };

    history[conversationID].push(userRequest);

    try {
      await message.react(`⏳`);
      let response = await ollama.chat({
        model: config.modules.ai.model,
        messages: history[conversationID],
      });

      response.message.content = response.message.content.replace(/@/g, "@ ");
      while (response.message.content.includes("$trigger")) {
        const trigger = await actions.triggers.getRandomByTagFor(
          message.author.id,
          ["green", "anytime"],
        );
        response.message.content = response.message.content.replace(
          "$trigger",
          trigger.what,
        );
      }

      history[conversationID].push(response.message);

      let think = response.message.content.match(/<think>.+<\/think>/s)?.[0];
      let actualContent = response.message.content.replace(think, "");

      let parts = actualContent.match(/.{1,2000}/gs);

      for (let part in parts) {
        if (parseInt(part) === parts.length - 1 && think) {
          let msg = await message.reply({
            content: parts[part],
            components: [
              // @ts-ignore
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setCustomId("think")
                  .setLabel("Show Thoughts")
                  .setStyle(ButtonStyle.Primary),
              ),
            ],
          });
          const collector = msg.createMessageComponentCollector({
            time: 1000 * 120,
          });
          collector.on("collect", async (i) => {
            await i.deferUpdate();
            let parts = think.split(/.{1,2000/gs);
            for await (let part of parts) await msg.reply(`Think: ` + part);
          });
          continue;
        }
        await message.reply(parts[part]);
      }
    } catch (e) {
      return message.reply(e.toString());
    }
  },
};

export default command;
