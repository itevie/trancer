import fs from "fs";
import { client } from "..";
import { getUser } from "./other";
import Logger from "./Logger";

const logger = new Logger("cached-usernames");
export const cachedUsernamesPath = __dirname + "/../data/cached_usernames.json";
if (!fs.existsSync(cachedUsernamesPath))
  fs.writeFileSync(cachedUsernamesPath, "{}");
export const cachedUsernamesMap: Record<string, string> = JSON.parse(
  fs.readFileSync(cachedUsernamesPath, "utf-8"),
);

export class CachedUsernames {
  public getID(username: string): string | null {
    return Object.entries(username).find((x) => x[1] === username)?.[0];
  }

  public async get(id: string): Promise<string> {
    let username: string;

    if (client.users.cache.has(id)) {
      username = client.users.cache.get(id).username;
      if (cachedUsernamesMap[id] !== username) {
        cachedUsernamesMap[id] = username;
        fs.writeFileSync(
          cachedUsernamesPath,
          JSON.stringify(cachedUsernamesMap),
        );
      }
    } else if (cachedUsernamesMap[id]) {
      username = cachedUsernamesMap[id];
    } else {
      username = (await client.users.fetch(id)).username;
      cachedUsernamesMap[id] = username;
      fs.writeFileSync(cachedUsernamesPath, JSON.stringify(cachedUsernamesMap));
    }

    return username;
  }

  public getSync(id: string): string {
    if (!cachedUsernamesMap[id]) {
      logger.log(`Fetching user id ${id}`);
      setTimeout(async () => {
        try {
          await getUser(id);
        } catch (e) {
          console.log(e);
        }
      }, 1);
    }

    return cachedUsernamesMap[id] || `<${id}>`;
  }
}

const cachedUsernames = new CachedUsernames();
export default cachedUsernames;
