import fs from "fs";
import { client } from "..";
import { getUser } from "./other";
import Logger from "./Logger";

const logger = new Logger("cached-usernames");
export class CachedUsernames {
  public readonly path: string = __dirname + "/../data/cached_usernames.json";
  public map: Record<string, string> = JSON.parse(
    fs.readFileSync(this.path, "utf-8"),
  );

  public getID(username: string): string | null {
    return Object.entries(username).find((x) => x[1] === username)?.[0];
  }

  public async get(id: string): Promise<string> {
    let username: string;

    if (client.users.cache.has(id)) {
      username = client.users.cache.get(id).username;
      if (this.map[id] !== username) {
        this.map[id] = username;
        fs.writeFileSync(this.path, JSON.stringify(this.map));
      }
    } else if (this.map[id]) {
      username = this.map[id];
    } else {
      username = (await client.users.fetch(id)).username;
      this.map[id] = username;
      fs.writeFileSync(this.path, JSON.stringify(this.map));
    }

    return username;
  }

  public getSync(id: string): string {
    if (!this.map[id]) {
      logger.log(`Fetching user id ${id}`);
      setTimeout(async () => {
        try {
          await getUser(id);
        } catch (e) {
          console.log(e);
        }
      }, 1);
    }

    return this.map[id] || `<${id}>`;
  }
}

const cachedUsernames = new CachedUsernames();
console.log(cachedUsernames.map);

if (!fs.existsSync(cachedUsernames.path))
  fs.writeFileSync(cachedUsernames.path, "{}");
export default cachedUsernames;
