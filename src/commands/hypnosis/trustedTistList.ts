import { User } from "discord.js";
import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";
import { createEmbed, paginate } from "../../util/other";
import { getUsername, getUsernameSync } from "../../util/cachedUsernames";

const command: HypnoCommand = {
  name: "trustedtistlist",
  aliases: ["tistlist"],
  type: "hypnosis",
  description: "Lists all of your trusted tists",

  handler: async (message) => {
    const list = await actions.triggers.trustedTists.getListFor(
      message.author.id
    );

    return paginate({
      embed: createEmbed().setTitle("Your trusted tists"),
      type: "description",
      data: list.map((x) => getUsernameSync(x.trusted_user_id)),
      replyTo: message,
    });
  },
};

export default command;
