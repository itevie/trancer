import express from "express";
import cors from "cors";
import { existsSync } from "fs";
import config from "../config";
import Logger from "../util/Logger";
import { database } from "../util/database";
import { getAllGuildsUserData } from "../util/actions/userData";
import { client } from "..";
import {
  analyticDatabase,
  getAllCommandUsage,
  getMemberCounts,
  getMessageAtTimes,
} from "../util/analytics";
import { generateCode } from "../util/other";
import path from "path";

const logger = new Logger("website");
const codes: { [key: string]: string } = {};

export default function initServer() {
  const app = express();
  app.use(cors());

  app.get("/", (_, res) => {
    return res.redirect("https://dawn.rest/trancer");
  });

  app.get("/gifs/:type/:id", async (req, res) => {
    if (!["spirals"].includes(req.params.type))
      return res.status(400).send({ message: "Invalid GIF type" });
    if (!req.params["id"].match(/[0-9]+-[a-zA-Z_0-9.]+\.gif/)) {
      return res.status(404).send({ message: "Unknown spiral" });
    }

    let p = path.normalize(
      `${__dirname}/../data/${req.params.type}/${req.params.id}`
    );
    console.log(p);

    if (!existsSync(p)) {
      return res.status(404).send({ message: "Unknown spiral" });
    }

    return res.status(200).sendFile(p);
  });

  app.get("/data/:type", async (req, res) => {
    if (!req.headers.authorization)
      return res.status(401).send({ message: "Missing authorization header" });
    if (!codes[req.headers.authorization])
      return res.status(401).send({ message: "Invalid authorization code" });

    let parts = req.params.type.split("-");

    switch (parts[0] || "") {
      case "economy":
        return res.status(200).send({
          data: await database.all(`SELECT user_id, balance FROM economy;`),
        });
      case "money_transactions":
        let userId = parts[1];
        if (!userId)
          return res
            .status(400)
            .send(
              `No user ID provided. Pass it using /data/money_transactions-ID`
            );
        let transactions = await analyticDatabase.all<MoneyTransaction[]>(
          "SELECT * FROM money_transactions WHERE user_id = ? ORDER BY id DESC LIMIT 1000;",
          userId
        );
        return res.status(200).send({
          data: transactions,
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
