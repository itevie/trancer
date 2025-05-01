import { Role } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { paginate } from "../../util/components/pagination";
import { createEmbed } from "../../util/other";
import { getUsernameSync } from "../../util/cachedUsernames";
import { escapeDisc } from "../../util/language";

const command: HypnoCommand<{ roles: Role[] }> = {
  name: "whohasroles",
  description: "Check who has different roles in your server",
  type: "admin",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "roles",
        type: "array",
        inner: "role",
        description: "The roles to check",
      },
    ],
  },

  handler: async (message, { args }) => {
    paginate({
      message,
      embed: createEmbed().setTitle("Who has the roles"),
      type: "field",
      data: args.roles.map((x) => ({
        name: `${x.name}`,
        value: escapeDisc(
          x.members.map((x) => getUsernameSync(x.id)).join(", "),
        ),
        inline: true,
      })),
    });
  },
};

export default command;
