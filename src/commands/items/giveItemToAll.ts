import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { database } from "../../util/database";

const command: HypnoCommand<{ item: Item }> = {
  name: "giveitemtoall",
  type: "economy",
  description: "Give everyone an item",

  args: {
    requiredArguments: 1,
    args: [
      {
        name: "item",
        type: "item",
      },
    ],
  },

  handler: async (message, { args }) => {
    await database.run(
      `
      INSERT INTO aquired_items (item_id, user_id, amount, protected)
      SELECT
        ?,
        user_id,
        1,
        FALSE
      FROM user_data
      WHERE guild_id = ?
      ON CONFLICT(item_id, user_id) DO UPDATE SET
        amount = aquired_items.amount + EXCLUDED.amount;;
`,
      args.item.id,
      config.botServer.id,
    );

    return message.reply(`Done!`);
  },
};

export default command;
