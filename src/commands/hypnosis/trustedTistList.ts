import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { createEmbed } from "../../util/other";
import cachedUsernames from "../../util/cachedUsernames";
import { paginate } from "../../util/components/pagination";

const command: HypnoCommand = {
  name: "trustedtistlist",
  aliases: ["tistlist"],
  type: "hypnosis",
  description: "Lists all of your trusted tists",

  handler: async (message) => {
    const list = await actions.triggers.trustedTists.getListFor(
      message.author.id,
    );

    return paginate({
      embed: createEmbed().setTitle("Your trusted tists"),
      type: "description",
      data: list.map((x) => cachedUsernames.getSync(x.trusted_user_id)),
      message: message,
    });
  },
};

export default command;
