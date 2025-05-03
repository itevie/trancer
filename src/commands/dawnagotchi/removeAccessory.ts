import { HypnoCommand } from "../../types/util";
import ConfirmAction from "../../util/components/Confirm";
import { actions } from "../../util/database";
import { itemIDMap } from "../../util/db-parts/items";
import { b, itemText } from "../../util/language";
import { createEmbed } from "../../util/other";
import {
  AccessoryPlace,
  accessoryPlaces,
  getDawnagotchiAccessory,
} from "./_util";

const command: HypnoCommand<{ place: AccessoryPlace }> = {
  name: "removeaccessory",
  description: "Remove an accessory from your Dawn!",
  type: "dawnagotchi",
  aliases: ["removeacc"],

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "place",
        type: "string",
        oneOf: [...accessoryPlaces],
      },
    ],
  },

  handler: async (message, { args }) => {
    const dawn = await actions.dawnagotchi.getFor(message.author.id);
    if (!dawn) return message.reply(`You don't have a Dawn!`);

    const key = `acc_${args.place}`;
    if (!dawn[key])
      return message.reply(`Your Dawn does not have an accessory there!`);

    ConfirmAction({
      embed: createEmbed()
        .setTitle("Are you sure?")
        .setDescription(
          `Are you sure you want to take the ${itemText(itemIDMap[dawn[key]])} from your Dawn?`,
        ),
      message,
      callback: async () => {
        await actions.dawnagotchi.setAccessory(
          message.author.id,
          args.place,
          null,
        );
        return {
          embeds: [
            createEmbed()
              .setTitle("Success!")
              .setDescription(
                `You removed the ${itemText(itemIDMap[dawn[key]])} from your Dawn!`,
              ),
          ],
        };
      },
    });
  },
};

export default command;
