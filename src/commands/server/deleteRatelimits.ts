import { HypnoCommand } from "../../types/util";
import { actions, database } from "../../util/database";

const command: HypnoCommand = {
  name: "deleteratelimit",
  aliases: ["delr"],
  description: "",
  type: "admin",

  handler: async (message) => {
    await database.run(
      "DELETE FROM ratelimits WHERE user_id = ?",
      message.author.id,
    );
  },
};

export default command;
