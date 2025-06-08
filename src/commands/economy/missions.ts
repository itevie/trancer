import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { list } from "../../util/language";
import { msToHowLong, units } from "../../util/ms";
import { createEmbed } from "../../util/other";
import { englishifyRewardDetails } from "../items/_util";
import { missions } from "./_missions";

const command: HypnoCommand = {
  name: "missions",
  description: "Get your list of missions",
  type: "economy",

  handler: async (message) => {
    let userMissions = await actions.missions.fetchTodayFor(message.author.id);
    let ms: { name: string; value: string; inline: true }[] = [];

    for await (const m of userMissions) {
      ms.push({
        name: missions[m.name].description,
        value: list([
          ["Completed", (await missions[m.name].check(m)) + "%"],
          ["Rewards", englishifyRewardDetails(JSON.parse(m.rewards))],
        ]),
        inline: true,
      });
    }

    return {
      embeds: [
        createEmbed()
          .setTitle(`Your missions`)
          .addFields(ms)
          .setFooter({
            text:
              "New missions in " +
              msToHowLong(
                new Date(new Date().toISOString().split("T")[0]).getTime() +
                  units.day -
                  Date.now(),
              ),
          }),
      ],
    };
  },
};

export default command;
