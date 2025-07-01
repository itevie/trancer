import { writeFileSync } from "fs";
import { client } from "..";
import cachedUsernames, {
  cachedUsernamesMap,
  cachedUsernamesPath,
} from "../util/cachedUsernames";
import { units } from "../util/ms";
import { Timer } from "./timer";

const timer: Timer = {
  name: "reload-cached-usernames",
  every: units.minute * 30,
  execute: () => {
    for (const [_, user] of client.users.cache) {
      cachedUsernamesMap[user.id] = user.username;
    }

    writeFileSync(cachedUsernamesPath, JSON.stringify(cachedUsernamesMap));
  },
};

export default timer;
