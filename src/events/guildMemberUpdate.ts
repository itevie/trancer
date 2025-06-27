import { TextChannel } from "discord.js";
import { client } from "..";
import config from "../config";
import { createEmbed } from "../util/other";
import { currency } from "../util/language";
import ecoConfig from "../ecoConfig";
import { actions } from "../util/database";

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  if (newMember.guild.id !== config.botServer.id) return;

  if (!oldMember.premiumSince && newMember.premiumSince) {
    await actions.eco.addMoneyFor(
      newMember.user.id,
      ecoConfig.payouts.boosts.max,
      "helping",
    );
    if (
      !(await actions.badges.aquired.getAllFor(newMember.user.id)).some(
        (x) => x.badge_name === "booster",
      )
    )
      await actions.badges.addFor(newMember.user.id, "booster");
    const channel = (await client.channels.fetch(
      config.botServer.channels.boosts,
    )) as TextChannel;
    await channel.send({
      embeds: [
        createEmbed()
          .setTitle(`${newMember.user.username} boosted!`)
          .setDescription(
            `Thanks <@${
              newMember.user.id
            }> for boosting our server! We now have **${
              newMember.guild.premiumSubscriptionCount
            }** bosts!\nYou have received ${currency(
              ecoConfig.payouts.boosts.max,
            )}`,
          ),
      ],
    });
  }
});
