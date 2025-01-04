import { TextChannel } from "discord.js";
import { client } from "..";
import config from "../config";
import { createEmbed } from "../util/other";
import { currency } from "../util/textProducer";
import ecoConfig from "../ecoConfig";
import { addMoneyFor } from "../util/actions/economy";

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  if (!oldMember.premiumSince && newMember.premiumSince) {
    await addMoneyFor(
      newMember.user.id,
      ecoConfig.payouts.boosts.max,
      "helping"
    );
    const channel = (await client.channels.fetch(
      config.botServer.channels.boosts
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
              ecoConfig.payouts.boosts.max
            )}`
          ),
      ],
    });
  }
});
