import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  Entitlement,
} from "discord.js";
import { HypnoCommand } from "../../types/util";
import { createEmbed, generateCode } from "../../util/other";
import { actions } from "../../util/database";
import { giveRewardDeteils } from "../items/_util";

const command: HypnoCommand<{ what: string; minLevel?: number }> = {
  name: "startgiveaway",
  description: "Starts a giveaway in the current channel",
  type: "admin",
  permissions: ["ManageMessages"],

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "what",
        type: "string",
        takeContent: true,
        description: "What you are giveing away",
      },
      {
        name: "minLevel",
        type: "wholepositivenumber",
        wickStyle: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    const id = generateCode(5);
    const msg = await message.channel.send({
      embeds: [
        generateEmbed(0, {
          min_level: args.minLevel,
          what: args.what,
        }),
      ],
      components: [
        // @ts-ignore
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`giveaway-join-${id}`)
            .setLabel("Join")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`giveaway-finish-${id}`)
            .setLabel("Finish")
            .setStyle(ButtonStyle.Secondary)
        ),
      ],
    });

    await actions.giveaways.create({
      id,
      what: args.what,
      message_id: msg.id,
      channel_id: message.channel.id,
      author_id: message.author.id,
      min_level: args.minLevel,
    });
  },
};

export default command;

export function generateEmbed(
  entries: number,
  giveaway: Partial<Giveaway>
): EmbedBuilder {
  return createEmbed()
    .setTitle(`New giveaway for ${giveaway.what}`)
    .setDescription(
      `Click the button below to join the giveaway for **${giveaway.what}**` +
        (giveaway.min_level
          ? `\n\n**You must be at least level ${giveaway.min_level}**`
          : "")
    )
    .setFooter({
      text: `Entries: ${entries}`,
    });
}
