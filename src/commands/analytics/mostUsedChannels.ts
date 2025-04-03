import { HypnoCommand } from "../../types/util";
import { getMessageInChannels } from "../../util/analytics";
import { paginate } from "../../util/components/pagination";
import { createEmbed } from "../../util/other";

const command: HypnoCommand = {
  name: "mostusedchannels",
  type: "analytics",
  description: "Get the list of the most used channels",

  handler: async (message) => {
    const data = (await getMessageInChannels())
      .filter((x) => x.guild_id === message.guild.id)
      .sort((a, b) => b.amount - a.amount);
    return paginate({
      message,
      embed: createEmbed().setTitle("Most used channels"),
      type: "description",
      data: data.map((x) => `<#${x.channel_id}>: ${x.amount} messages`),
    });
  },
};

export default command;
