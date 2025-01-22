import { HypnoCommand } from "../../types/util";
import { addTriggerFor } from "../../util/actions/imposition";
import { actions, database } from "../../util/database";
import fs from "fs";
import { createEmbed } from "../../util/other";

const command: HypnoCommand<{ trigger: string; bombard?: boolean }> = {
  name: "addtrigger",
  description:
    "Adds a trigger that can be used on you by the bot.\n\nCheck `.topic triggers` to get help on this",
  type: "hypnosis",
  aliases: ["addt", "at", "addi"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "trigger",
        type: "string",
        takeContent: true,
        description:
          'The trigger you want to add. Use "defaults" if you\'d like to add all of the default imposition.',
      },
      {
        name: "bombard",
        aliases: ["b"],
        type: "boolean",
        wickStyle: true,
        description:
          "Whether this trigger can only be used in the bombard command",
      },
    ],
  },

  handler: async (message, { args }) => {
    // Check if already added
    if (
      await database.get(
        `SELECT 1 FROM user_imposition WHERE user_id = ? AND what = ?;`,
        message.author.id,
        args.trigger
      )
    )
      return message.reply(`:warning: You have already added that trigger!`);

    // Check if they want to add defaults
    if (args.trigger.toLowerCase() === "defaults") {
      const triggers = fs
        .readFileSync(__dirname + "/../../data/impo.txt", "utf-8")
        .split("\n");
      const userTriggers = await actions.triggers.getFor(message.author.id);

      for await (const trigger of triggers)
        if (!userTriggers.some((x) => x.what === trigger))
          await addTriggerFor(message.author.id, trigger, false);

      return message.reply({
        embeds: [
          createEmbed()
            .setTitle("Added Defaults")
            .setDescription(triggers.join("\n")),
        ],
      });
    }

    // Add it
    await addTriggerFor(message.author.id, args.trigger, args.bombard ?? false);
    return message.reply(
      `Added the trigger! :cyclone:\nNote: you can manage your triggers more easier on the site: <https://trancer.dawn.rest/user_settings>`
    );
  },
};

export default command;
