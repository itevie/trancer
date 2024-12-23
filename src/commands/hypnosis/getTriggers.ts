import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { getTriggersFor } from "../../util/actions/imposition";
import { createEmbed, paginate } from "../../util/other";

const command: HypnoCommand<{ user?: User }> = {
  name: "gettriggers",
  type: "hypnosis",
  aliases: ["getriggers", "getimpos", "getis"],
  description: "Get yours or someone else's triggers",

  args: {
    requiredArguments: 0,
    args: [
      {
        name: "user",
        type: "user",
        infer: true,
      },
    ],
  },

  handler: async (message, { args }) => {
    const user = args.user ?? message.author;
    const triggers = await getTriggersFor(user.id);

    return paginate({
      replyTo: message,
      type: "description",
      data: triggers.map(
        (x) => `${x.what}${x.is_bombardable ? " (bombard)" : ""}`
      ),
      embed: createEmbed().setTitle(`Triggers for ${user.username}`),
      pageLength: 20,
    });
  },
};

export default command;
