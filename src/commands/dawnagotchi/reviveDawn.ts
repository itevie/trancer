import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { getEconomyFor, removeMoneyFor } from "../../util/actions/economy";
import { database } from "../../util/database";

const command: HypnoCommand = {
  name: "revivedawn",
  description: "Revive your dawn",
  type: "dawnagotchi",

  handler: async (message) => {
    const dawn = await database.get<Dawnagotchi>("SELECT * FROM dawnagotchi WHERE owner_id = ? ORDER BY id DESC LIMIT 1;", message.author.id);

    if (dawn.alive) {
      return message.reply(`Your Dawn is alive!`);
    }

    const economy = await getEconomyFor(message.author.id);
    if (economy.balance < 2500)
      return message.reply(`You need **2500 ${config.economy.currency}** to revive your Dawn, you horrible person.`);

    await database.run(`UPDATE dawnagotchi SET alive = true, next_feed = CURRENT_TIMESTAMP, next_drink = CURRENT_TIMESTAMP, next_play = CURRENT_TIMESTAMP WHERE id = ?;`, dawn.id);
    await removeMoneyFor(message.author.id, 2500);

    return message.reply(`Your Dawn was revived for **2500 ${config.economy.currency}**`);
  }
};

export default command;