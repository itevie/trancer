import axios from "axios";
import { HypnoCommand } from "../../types/util";
import { AttachmentBuilder } from "discord.js";

const fetchers: { [key: string]: (tags: string) => Promise<string> } = {
  cat: async (tags) => {
    console.log(`https://cataas.com/cat/${tags}`);
    return (await axios.get(`https://cataas.com/cat${tags ? `/${tags}` : ""}`))
      .data.url;
  },
  dog: async () => {
    return (await axios.get("https://random.dog/woof.json")).data.url;
  },
  duck: async () => {
    return (await axios.get("https://random-d.uk/api/quack")).data.url;
  },
  fox: async () => {
    return (await axios.get("https://randomfox.ca/floof/")).data.image;
  },
};

const command: HypnoCommand<{ tags?: string }> = {
  name: "_animal_image",
  description: "Get animal images! (use one of the aliases)",
  aliases: ["cat", "dog", "fox", "duck"],
  type: "fun",
  eachAliasIsItsOwnCommand: true,

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "tags",
        type: "string",
        description:
          "Tags seperated by commas (only some animals listen to this)",
      },
    ],
  },

  handler: async (message, { args, command }) => {
    if (command === "_animal_image")
      return message.reply(`Please use an alias instead!`);

    try {
      return message.reply(
        await fetchers[command](
          args.tags
            ? args.tags
                .split(",")
                .map((x) => x.trim())
                .join(",")
            : ""
        )
      );
    } catch (e) {
      console.log(e.message);
      return message.reply(command + " not found!");
    }
  },
};

export default command;
