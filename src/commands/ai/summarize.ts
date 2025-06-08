import config from "../../config";
import { HypnoCommand } from "../../types/util";
import ollama, { Message } from "ollama";

const prompts = {
  normal: (content: string) =>
    `Summarize the following text into 3–5 concise bullet points:\n\n${content}`,

  eli5: (content: string) =>
    `Summarize the following text so a 5-year-old could understand. Use simple words and short sentences:\n\n${content}`,

  eli2: (content: string) =>
    `Explain the following in a way a 2-year-old could understand. Use very basic words, like you would talk to a toddler:\n\n${content}`,

  tweet: (content: string) =>
    `Summarize the following text in a single tweet (max 280 characters):\n\n${content}`,

  paragraph: (content: string) =>
    `Summarize the following text in a short, clear paragraph:\n\n${content}`,

  haiku: (content: string) =>
    `Summarize the following text as a haiku:\n\n${content}`,

  sarcastic: (content: string) =>
    `Summarize the following in a sarcastic tone:\n\n${content}`,

  pirate: (content: string) =>
    `Summarize the following text like a pirate would speak:\n\n${content}`,
};

const command: HypnoCommand<{ content: string; type?: keyof typeof prompts }> =
  {
    name: "summarize",
    description: "Summarize with ai",
    type: "ai",

    args: {
      requiredArguments: 1,
      args: [
        {
          name: "content",
          takeContent: true,
          infer: true,
          type: "string",
        },
        {
          name: "type",
          wickStyle: true,
          type: "string",
          oneOf: Object.keys(prompts),
        },
      ],
    },

    handler: async (message, { args }) => {
      await message.react("⏳");
      let response = await ollama.chat({
        model: config.modules.ai.model,
        messages: [
          {
            role: "user",
            content: prompts[args.type ?? "normal"](args.content),
          },
        ],
      });

      if (!response?.message?.content) {
        return message.reply("❌ Failed to generate summary!!!");
      }

      return message.reply(response.message.content);
    },
  };

export default command;
