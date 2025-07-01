import { database } from "../util/database";
import { units } from "../util/ms";
import { getCurrentVC, past } from "./_vc";
import { Timer } from "./timer";

const timer: Timer = {
  name: "vc-statistic",
  every: units.minute,
  async execute() {
    let inVCrightNow = await getCurrentVC();

    // Award people who are still in it
    for await (const id of inVCrightNow)
      if (past.oneMinute.some((x) => x[0] === id[0]))
        await database.run(
          `UPDATE user_data SET vc_time = vc_time + 1 WHERE user_id = ? AND guild_id = ?`,
          id[0],
          id[1],
        );

    past.oneMinute = inVCrightNow;
  },
};

export default timer;
