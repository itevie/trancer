import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "alldawns",
  description: "Get statistics on all the Dawns",
  type: "dawnagotchi",

  handler: async (message) => {
    let dawns = await database.all<Dawnagotchi[]>(`SELECT * FROM dawnagotchi;`);
    let dawnsAlive = dawns.filter((x) => x.alive);
    let dawnsLeft = dawns.filter((x) => !x.alive);

    let amount = dawns.length;
    let oldest = dawnsAlive.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return message.reply({
      embeds: [
        createEmbed()
          .setTitle(`Details of all the Dawnagotchi's`)
          .setDescription(
            [
              `**Alive**: ${dawnsAlive.length}`,
              `**Left**: ${dawnsLeft.length}`,
              `**Total Overtime**: ${amount}`,
              ``,
              `**Oldest**: **${
                (await message.client.users.fetch(oldest[0].owner_id)).username
              }'s** Dawn obtained at **${new Date(
                oldest[0].created_at
              ).toDateString()}**`,
            ].join("\n")
          ),
      ],
    });
  },
};

export default command;
