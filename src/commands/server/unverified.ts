import { HypnoCommand } from "../../types/util";
import config from "../../config";
import { paginate } from "../../util/components/pagination";
import { createEmbed } from "../../util/other";
import { splitByLengthWithWhitespace } from "../../util/db-parts/quotes";
import { escapeDisc } from "../../util/language";

const command: HypnoCommand = {
  name: "unverified",
  description: "sends a list of unverified members",
  type: "admin",
  guards: ["admin"],

  handler: async (message) => {
    const members = await message.guild.members.fetch();

    const list = escapeDisc(
      members
        .filter((x) => {
          return (
            !x.user.bot && !x.roles.cache.has(config.botServer.roles.verified)
          );
        })
        .map((x) => x.user.username)
        .join(", "),
    );

    paginate({
      message,
      embed: createEmbed().setTitle("Unverified Members"),
      type: "field",
      data: splitByLengthWithWhitespace(list, 500).map((x, i) => ({
        name: `Part ${i + 1}`,
        value: x,
      })),
    });
  },
};

export default command;
