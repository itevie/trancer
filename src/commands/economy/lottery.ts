import { readFileSync } from "fs";
import config from "../../config";
import { HypnoCommand } from "../../types/util";
import { actions } from "../../util/database";
import { msToHowLong } from "../../util/ms";

const command: HypnoCommand = {
  name: "lottery",
  description: "Get details on the lottery",
  type: "economy",

  handler: async (message) => {
    const items = await actions.items.aquired.get(
      (
        await actions.items.getByName("lottery-ticket")
      ).id
    );
    const userIDs: string[] = items.reduce(
      (p, c) => [...p, ...Array(c.amount).fill(c.user_id)],
      [] as string[]
    );
    let prize: number = items.reduce(
      (p, c) => p + config.lottery.entryPrice * c.amount,
      config.lottery.basePool
    );

    return message.reply(
      `The lottery currently has **${
        userIDs.length
      } entries** with a prize pool of **${prize}${
        config.economy.currency
      }**\nIt ends in **${msToHowLong(
        config.lottery.length -
          (Date.now() -
            new Date(
              readFileSync(__dirname + "/../../../lottery.txt", "utf-8")
            ).getTime())
      )}**`
    );
  },
};

export default command;
