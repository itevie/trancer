import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import config from "../config";
import Logger from "../util/Logger";
import { database } from "../util/database";
import { getAllGuildsUserData } from "../util/actions/userData";
import { client } from "..";
import {
  getAllCommandUsage,
  getMemberCounts,
  getMessageAtTimes,
} from "../util/analytics";
import { generateCode } from "../util/other";

const logger = new Logger("website");
const codes: { [key: string]: string } = {};

export default function initServer() {
  const app = express();
  app.use(cors());

  app.get("/", (_, res) => {
    return res.send(readFileSync(__dirname + "/public/index.html", "utf-8"));
  });

  app.get("/script.js", (_, res) => {
    return res.send(readFileSync(__dirname + "/public/script.js", "utf-8"));
  });

  app.get("/style.css", (_, res) => {
    return res.sendFile(__dirname + "/public/style.css");
  });

  app.get("/data/:type", async (req, res) => {
    if (!req.headers.authorization)
      return res.status(401).send({ message: "Missing authorization header" });
    if (!codes[req.headers.authorization])
      return res.status(401).send({ message: "Invalid authorization code" });

    switch (req.params.type) {
      case "economy":
        return res.status(200).send({
          data: await database.all(`SELECT user_id, balance FROM economy;`),
        });
      case "user_data":
        return res.status(200).send({
          data: await getAllGuildsUserData(config.botServer.id),
        });
      case "member_count":
        return res.status(200).send({
          data: await getMemberCounts(config.botServer.id),
        });
      case "command_usage":
        return res.status(200).send({
          data: await getAllCommandUsage(),
        });
      case "messages":
        return res.status(200).send({
          data: await getMessageAtTimes(),
        });
      case "usernames":
        let usernames: { [key: string]: string } = {};
        for (const [k, v] of client.users.cache) {
          usernames[k] = v.username;
        }

        return res.status(200).send({
          data: usernames,
        });
      case "quotes":
        const quotes = await database.all<Quote[]>(
          `SELECT * FROM quotes WHERE server_id = (?);`,
          config.botServer.id
        );
        const optIn = (
          await database.all<UserData[]>(
            "SELECT * FROM user_data WHERE site_quote_opt_in = true;"
          )
        ).map((x) => x.user_id);
        return res.status(200).send({
          data: quotes.filter((x) => optIn.includes(x.author_id)),
        });
      default:
        return res.status(400).send("Invalid data type.");
    }
  });

  app.listen(config.website.port, () => {
    logger.log(`Website listening on port ${config.website.port}`);
  });
}

export function generateSiteCode(forId: string) {
  const code = generateCode(20);
  codes[code] = forId;
  return code;
}
