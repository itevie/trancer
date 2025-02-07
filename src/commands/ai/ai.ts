import ollama, { Message } from "ollama";
import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export const history: { [key: string]: Message[] } = {};
const helperMessage =
  "Your name is Trancer. You must act like a normal person, responding casually and using the same tone, slang, abbreviations, and style as the user. Respond to everything inside the quotes, and feel free to address users by their usernames if relevant. If the user uses informal, aggressive, or sarcastic language, respond with a similarly direct, laid-back, or confident style. Avoid being overly polite or formal, and reflect the mood and tone of the user without censoring the conversation too much. Keep it real and true to the user's vibe.";

let isProcessing: boolean = false;

const command: HypnoCommand = {
  name: "ai",
  description: "Chat with an AI (ai sucks)",
  type: "ai",

  handler: async (message, o) => {
    if (message.client.user.id !== config.devBot.id) {
      return message.reply(
        "Oopsies! Only Trancer Dev can run process this command."
      );
    }

    //if (isProcessing)
    //  return message.reply(`Sorry! The AI is already processing something.`);
    isProcessing = true;

    const conversationID = message.author.id.toString();

    if (!history[conversationID])
      history[conversationID] = [
        {
          role: "system",
          content: helperMessage,
        },
      ];

    let content = o.oldArgs.join(" ");

    if (content.includes("$members")) {
      let members = (await message.guild.members.fetch()).map(
        (x) => x.user.username
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
                  .setStyle(ButtonStyle.Primary)
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
    } finally {
      isProcessing = false;
    }
  },
};

export default command;
