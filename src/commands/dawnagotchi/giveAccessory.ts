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

const command: HypnoCommand<{ place: AccessoryPlace; item: Item }> = {
  name: "giveaccessory",
  description: "Give a Dawn an accessory!",
  type: "dawnagotchi",
  aliases: ["giveacc"],

  args: {
    requiredArguments: 2,
    args: [
      {
        name: "place",
        type: "string",
        oneOf: [...accessoryPlaces],
      },
      {
        name: "item",
        type: "item",
      },
    ],
  },

  handler: async (message, { args }) => {
    const dawn = await actions.dawnagotchi.getFor(message.author.id);
    if (!dawn) return message.reply(`You don't have a Dawn!`);
    const aquired = await actions.items.aquired.getFor(
      message.author.id,
      args.item.id,
    );
    if ((aquired.amount ?? 0) === 0)
      return message.reply(`You do not have a ${itemText(args.item)}`);

    const accessory = getDawnagotchiAccessory(args.item);
    if (accessory === null)
      return message.reply(`Sorry :( you can't put that on your Dawn...`);
    if (!accessory[1].includes(args.place))
      return message.reply(
        `You can't put that item there! But you can put it here: ${accessory[1].map((x) => b(x)).join(", ")}`,
      );

    const key = `acc_${args.place}`;
    if (dawn[key] === args.item.id)
      return message.reply(`Your Dawn already has that on!`);
    else if (dawn[key] !== null) {
      ConfirmAction({
        message,
        embed: createEmbed()
          .setTitle(`Change accessory?`)
          .setDescription(
            `Your Dawn already has a ${itemText(itemIDMap[dawn[key]])} on! Would you like to replace it with a ${itemText(args.item)}?`,
          ),
        callback: async () => {
          await actions.items.aquired.addFor(message.author.id, dawn[key], 1);
          await actions.dawnagotchi.setAccessory(
            message.author.id,
            args.place,
            args.item.id,
          );
          return {
            embeds: [
              createEmbed()
                .setTitle("Accessory Updated!")
                .setDescription(
                  `You gave your Dawn a ${itemText(args.item)} on it's **${args.place}**!\nYou were given a ${itemText(itemIDMap[dawn[key]])}`,
                ),
            ],
          };
        },
      });
    } else {
      await actions.dawnagotchi.setAccessory(
        message.author.id,
        args.place,
        args.item.id,
      );
      return message.reply({
        embeds: [
          createEmbed()
            .setTitle("Accessory Updated!")
            .setDescription(
              `You gave your Dawn a ${itemText(args.item)} on it's **${args.place}**!`,
            ),
        ],
      });
    }
  },
};

export default command;
