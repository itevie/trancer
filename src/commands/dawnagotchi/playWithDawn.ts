import config from "../../config";
import ecoConfig from "../../ecoConfig";
import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";
import {
  awardMoneyForCaringForDawn,
  calculateRequirementFromDate,
  generateDawnagotchiEmbed,
} from "./_util";
import { currency } from "../../util/textProducer";

const command: HypnoCommand = {
  name: "play",
  type: "dawnagotchi",
  description: "Play with your Dawn",

  handler: async (message) => {
    // Check if they have a Dawn
    let dawn = await actions.dawnagotchi.getFor(message.author.id);
    if (!dawn) return message.reply(`You don't have a Dawn!`);

    // Check if allowed to feed
    let requirement = calculateRequirementFromDate(dawn.next_play);

    if (requirement >= 100)
      return message.reply(
        `Your Dawn does not require your attention right now >:(`
      );

    // Check if they have the power play
    let powerPlay = await actions.items.aquired.getFor(
      message.author.id,
      await actions.items.getId(ecoConfig.items.powerPlay)
    );
    let timeAdd = config.dawnagotchi.actions.play.timeAdd;
    if (powerPlay && powerPlay.amount > 0) {
      timeAdd = timeAdd * 3;
      if (Math.random() > 0.5) {
        await actions.items.aquired.removeFor(
          message.author.id,
          await actions.items.getId(ecoConfig.items.powerPlay)
        );
        await message.reply(
          `Oops... your Dawn ate the pendulum... you lost one...`
        );
      }
    }

    // Add the stuff
    await database.run(
      `UPDATE dawnagotchi SET next_play = next_play + ? WHERE owner_id = ?`,
      timeAdd,
      message.author.id
    );

    let money = await awardMoneyForCaringForDawn(dawn);

    // Done
    return message.reply({
      content: money ? `You got ${currency(money)}` : "",
      embeds: [
        generateDawnagotchiEmbed(
          await actions.dawnagotchi.getFor(message.author.id)
        ),
      ],
    });
  },
};

export default command;
