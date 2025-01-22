import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { getRandomSpiral } from "../../util/spirals";

export const sentSpirals: { [key: string]: Spiral } = {};

const command: HypnoCommand = {
  name: "spiral",
  type: "spirals",
  aliases: ["s"],
  description: "Sends a random spiral :cyclone:",
  usage: [["spiral list", "List the amount of spirals registered"]],

  handler: async (message, { oldArgs: args }) => {
    if (args[0] === "list") {
      return message.reply(
        `There are ${
          (await actions.spirals.getAll()).length
        } spirals registered`
      );
    }

    let spiral;

    if (!isNaN(parseInt(args[0] ?? ""))) {
      let idx = parseInt(args[0]);
      let spirals = await actions.spirals.getAll();
      if (idx >= spirals.length)
        return message.reply(`There are not that many spirals!`);
      spiral = spirals[idx];
    } else {
      spiral = await getRandomSpiral();
    }

    let msg = await message.channel.send(
      spiral.link.replace(/^(<)/, "").replace(/(>)$/, "")
    );

    sentSpirals[msg.id] = spiral;

    if (Object.keys(sentSpirals).length > 50)
      for (let i = 0; i != 25; i++)
        delete sentSpirals[Object.keys(sentSpirals)[i]];

    return;
  },
};

export default command;
