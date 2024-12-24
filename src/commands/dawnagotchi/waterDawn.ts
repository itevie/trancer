import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { getDawnagotchi } from "../../util/actions/dawnagotchi";
import { actions, database } from "../../util/database";
import {
  awardMoneyForCaringForDawn,
  calculateRequirementFromDate,
  generateDawnagotchiEmbed,
} from "../../util/dawnagotchi";

const command: HypnoCommand = {
  name: "water",
  type: "dawnagotchi",
  description: "Water your Dawn",

  handler: async (message) => {
    // Check if they have a Dawn
    let dawn = await getDawnagotchi(message.author.id);
    if (!dawn) return message.reply(`You don't have a Dawn!`);

    // Check if allowed to feed
    let requirement = calculateRequirementFromDate(dawn.next_drink);

    if (requirement >= 100)
      return message.reply(`Your Dawn does not need watering!`);

    // Check if they have the power drink
    let powerDrink = await actions.items.aquired.getFor(
      message.author.id,
      (
        await actions.items.getByName(config.items.powerDrink)
      ).id
    );
    let timeAdd = config.dawnagotchi.actions.water.timeAdd;
    if (powerDrink && powerDrink.amount > 0) {
      timeAdd = timeAdd * 3;
      await actions.items.aquired.removeFor(
        message.author.id,
        config.items.powerFood
      );
    }

    // Add the stuff
    await database.run(
      `UPDATE dawnagotchi SET next_drink = next_drink + ? WHERE owner_id = ?`,
      timeAdd,
      message.author.id
    );

    let money = await awardMoneyForCaringForDawn(dawn);

    // Done
    return message.reply({
      content: money ? `You got **${money}${config.economy.currency}** ` : "",
      embeds: [
        generateDawnagotchiEmbed(await getDawnagotchi(message.author.id)),
      ],
    });
  },
};

export default command;
