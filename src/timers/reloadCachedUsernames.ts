import { writeFileSync } from "fs";
import { client } from "..";
import cachedUsernames from "../util/cachedUsernames";
import { units } from "../util/ms";
import { Timer } from "./timer";

const timer: Timer = {
  name: "reload-cached-usernames",
  every: units.minute * 30,
  execute: () => {
    for (const [_, user] of client.users.cache) {
      cachedUsernames.map[user.id] = user.username;
    }

    writeFileSync(cachedUsernames.path, JSON.stringify(cachedUsernames));
  },
};

export default timer;
