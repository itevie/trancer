import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { generateCode } from "../../util/other";

export const noDiscords: Map<string, string> = new Map();

const command: HypnoCommand = {
  name: "dashboard",
  aliases: ["sset", "serversettings", "autoban", "ab"],
  description: "Get the link to your server's dashboard",
  type: "admin",
  permissions: ["ManageGuild"],

  handler: async (message) => {
    const msg = await message.reply({
      content: `https://trancer.dawn.rest/servers/${message.guild.id}/dashboard`,
      components: [
        // @ts-ignore
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel("Don't wanna login with Discord?")
            .setCustomId("no-discord"),
        ),
      ],
    });

    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
    });

    collector.on("collect", (i) => {
      if (i.customId === "no-discord") {
        let id = generateCode(64);
        noDiscords.set(id, i.user.id);
        return i.reply({
          ephemeral: true,
          content: `https://trancer.dawn.rest/servers/${message.guild.id}/dashboard?nodiscord=${id}`,
        });
      }
    });
  },
};

export default command;
