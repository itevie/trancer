import ollama, { Message } from "ollama";
import config from "../../config";
import { HypnoCommand } from "../../types/util";

export const history: { [key: string]: Message[] } = {};

const helperMessage =
  "You are the AI, your name is Jenifer. The messages from users will be prefixed by their usernames. Respond to the contents inside the quotes, and you can address users by their usernames if relevant.";

let isProcessing: boolean = false;

const command: HypnoCommand = {
  name: "ai",
  description: "Chat with an AI (ai sucks)",
  type: "ai",

  handler: async (message, o) => {
    if (message.client.user.id !== config.devBot) {
      return message.reply(
        "Oopsies! Only Trancer Dev can run process this command."
      );
    }

    if (isProcessing)
      return message.reply(`Sorry! The AI is already processing something.`);
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
        model: "llama3.2",
        messages: history[conversationID],
      });

      if (response.message.content.includes("@"))
        return message.reply(`Nuh uh! Don't you ping people.`);

      history[conversationID].push(response.message);

      let parts = response.message.content.match(/.{1,2000}/gs);

      for (let part of parts) {
        await message.reply(part);
      }
    } catch (e) {
      return message.reply(e.toString());
    } finally {
      isProcessing = false;
    }
  },
};

export default command;
