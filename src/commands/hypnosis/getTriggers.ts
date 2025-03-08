import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { createEmbed } from "../../util/other";
import { tagEmojiMap } from "../../util/db-parts/triggers";
import { actions } from "../../util/database";
import { paginate } from "../../util/components/pagination";

const command: HypnoCommand<{ user?: User }> = {
  name: "gettriggers",
  type: "hypnosis",
  aliases: ["getriggers", "getimpos", "getis", "triggers"],
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
    const triggers = await actions.triggers.getAllFor(user.id);

    return paginate({
      replyTo: message,
      type: "description",
      data: triggers.map(
        (x) =>
          `${x.what}${
            x.tags.length > 0
              ? ` [${x.tags
                  .split(";")
                  .map((x) => tagEmojiMap[x])
                  .join("")}]`
              : ""
          }`
      ),
      embed: createEmbed().setTitle(`Triggers for ${user.username}`),
      pageLength: 20,
    });
  },
};

export default command;
