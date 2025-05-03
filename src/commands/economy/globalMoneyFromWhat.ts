import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";
import config from "../../config";
import ecoConfig from "../../ecoConfig";
import { actions } from "../../util/database";

const command: HypnoCommand = {
  name: "globalmoneyfromwhat",
  aliases: ["gmfw", "gmoneyfromwhat"],
  description: "Check where everyone got money from",
  type: "economy",

  handler: async (message) => {
    // Create an eco to add onto
    let currentEco: Economy = {
      from_commands: 0,
      from_gambling: 0,
      from_helping: 0,
      from_messaging: 0,
      from_gambling_lost: 0,
      last_dawn_care: 0,
      last_dawn_care_all_100: 0,
      from_vc: 0,
      balance: 0,
      user_id: "0",
      last_daily: 0,
      last_fish: 0,
      mine_xp: 0,
      fish_xp: 0,
      work_xp: 0,
      job: null,
    };

    let ecos = await actions.eco.getAll();

    // Add all the shit to it
    for (const eco of ecos) {
      currentEco.from_commands += eco.from_commands;
      currentEco.from_gambling += eco.from_gambling;
      currentEco.from_helping += eco.from_helping;
      currentEco.from_messaging += eco.from_messaging;
      currentEco.from_gambling_lost += eco.from_gambling_lost;
      currentEco.from_vc += eco.from_vc;
    }

    // Done
    return message.reply({
      embeds: [
        createEmbed()
          .setTitle(`How EVERYONE got ${ecoConfig.currency}`)
          .setDescription(
            [
              ["Commands", currentEco.from_commands],
              ["Gambling", currentEco.from_gambling],
              ["Gambling Lost", currentEco.from_gambling_lost],
              ["Messaging", currentEco.from_messaging],
              ["VC", currentEco.from_vc],
              ["Helping", currentEco.from_helping],
            ]
              .map((x) => `**${x[0]}**: ${x[1]}${ecoConfig.currency}`)
              .join("\n"),
          ),
      ],
    });
  },
};

export default command;
