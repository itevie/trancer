import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";

const command: HypnoCommand = {
  name: "obtaindawnagotchi",
  aliases: ["setupdawn", "setupdawnagotchi", "obtaindawn"],
  description: "Setup your new adventure with Dawn!",
  type: "dawnagotchi",

  handler: async (message) => {
    // Check if it is already setup
    let dawnagotchi = await actions.dawnagotchi.getFor(message.author.id);
    if (dawnagotchi) return message.reply(`You already have a Dawnagotchi!`);

    // Setup
    await actions.dawnagotchi.setupFor(message.author.id);

    return message.reply({
      content: `A Dawn came up to you! And you obtained it! This must be the start of an amazing adventure`,
    });
  },
};

export default command;
