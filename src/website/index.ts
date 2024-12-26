import express, { NextFunction } from "express";
import cors from "cors";
import { existsSync } from "fs";
import config from "../config";
import Logger from "../util/Logger";
import { actions, database } from "../util/database";
import { client } from "..";
import {
  analyticDatabase,
  getAllCommandUsage,
  getMemberCounts,
  getMessageAtTimes,
} from "../util/analytics";
import { generateCode } from "../util/other";
import path from "path";
import passport from "passport";
import { Strategy } from "passport-discord";
import session from "express-session";
import sqliteStoreFactory from "express-session-sqlite";
import sqlite3 from "sqlite3";
import { MakeServerRoutes } from "./routes/api/serverRoutes";
const SqliteStore = sqliteStoreFactory(session);

const logger = new Logger("website");
const codes: { [key: string]: string } = {};
const baseUrl = "http://localhost:3000";

export default function initServer() {
  const app = express();
  app.use(cors());
  app.use("/", express.static(__dirname + "/app/build"));

  app.use(MakeServerRoutes());

  /*
  app.use(
    cors({
      origin: baseUrl,
      credentials: true,
    })
  );

  app.use(
    session({
      secret: "meow",
      store: new SqliteStore({
        driver: sqlite3.Database,
        path: path.join(__dirname, "session.db"),
        ttl: 1234,
      }),
      resave: true,
      saveUninitialized: false,
      cookie: {
        httpOnly: false,
        secure: false,
        sameSite: "none",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(
    new Strategy(
      {
        clientID: "1257438471664963705",
        clientSecret: "QJnG9r9HB9D-PImDsd6riNC1xiFQgFws",
        callbackURL: "http://localhost:8080/auth/discord",
      },
      async function (_accessToken, _refreshToken, profile, cb) {
        return cb(null, { id: profile.id });
      }
    )
  );

  passport.serializeUser(function (user, done) {
    console.log(user);
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    console.log(user, "d");
    done(null, user);
  });

  app.get(
    "/auth/discord",
    passport.authenticate("discord", { scope: ["identify"] }),
    (req, res) => {
      console.log(req.session, req.user);
      res.redirect(baseUrl);
    }
  );

  function authenticate(
    req: Express.Request,
    _res: Express.Response,
    next: NextFunction
  ) {
    if (req.isAuthenticated()) {
      console.log("authed");
    }
    console.log(req.session, req.user);
    next();
  }*/

  app.get("/api/servers", async (_, res) => {
    console.log(await client.guilds.fetch());
    return res.status(200).send(
      (await client.guilds.fetch()).map((x) => {
        return {
          id: x.id,
          name: x.name,
          avatar: x.iconURL(),
        };
      })
    );
  });

  app.get("/api/data/:type", async (req, res) => {
    /*if (!req.headers.authorization)
      return res.status(401).send({ message: "Missing authorization header" });
    if (!codes[req.headers.authorization])
      return res.status(401).send({ message: "Invalid authorization code" });*/

    let parts = req.params.type.split("-");

    switch (parts[0] || "") {
      case "economy":
        return res
          .status(200)
          .send(await database.all(`SELECT user_id, balance FROM economy;`));
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
        return res.status(200).send(transactions);
      case "user_data":
        return res
          .status(200)
          .send(await actions.userData.getForServer(config.botServer.id));
      case "member_count":
        return res.status(200).send(await getMemberCounts(config.botServer.id));
      case "command_usage":
        return res.status(200).send(await getAllCommandUsage());
      case "messages":
        return res.status(200).send(await getMessageAtTimes());
      case "usernames":
        let usernames: { [key: string]: string } = {};
        for (const [k, v] of client.users.cache) {
          usernames[k] = v.username;
        }

        return res.status(200).send(usernames);
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
        return res
          .status(200)
          .send(quotes.filter((x) => optIn.includes(x.author_id)));
      default:
        return res.status(400).send("Invalid data type.");
    }
  });

  app.get(["/", "/servers", "/servers/:id/:type?"], (_, res) => {
    return res.sendFile(__dirname + "/app/build/index.html");
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
    if (!existsSync(p)) {
      return res.status(404).send({ message: "Unknown spiral" });
    }

    return res.status(200).sendFile(p);
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
