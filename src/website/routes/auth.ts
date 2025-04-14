import { NextFunction, Request, Response, Router } from "express";
import { baseUrl } from "..";
import axios from "axios";
import jwt from "jsonwebtoken";
import { client } from "../..";
import config from "../../config";
import { noDiscords } from "../../commands/server/dashboard";
import { getUsernameSync } from "../../util/cachedUsernames";

export function Authenticate(req: Request, res: Response, next: NextFunction) {
  if (req.url.startsWith("/login")) return next();

  // Check if development
  if (client.user.id === config.devBot.id) {
    // @ts-ignore
    req.user = config.owner;
    return next();
  }

  if (req.query.nodiscord) {
    if (!noDiscords.get(req.query.nodiscord as string)) {
      return res.status(400).send("invalid nodiscord");
    }

    let id = noDiscords.get(req.query.nodiscord as string);

    const token = jwt.sign(
      {
        id: id,
        username: getUsernameSync(id),
      },
      process.env.JWT_SECRET,
      { expiresIn: "28d" },
    );
    res.cookie("trancer-token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 28,
      path: "/",
    });

    // @ts-ignore
    req.user = id;
    return next();
  }

  const token = req.headers.cookie
    ?.match(/trancer-token=[a-zA-Z0-9\._\-]+/)?.[0]
    .split("=")[1];
  try {
    const result = jwt.verify(token, process.env.JWT_SECRET);
    // @ts-ignore
    req.user = result.id;
  } catch (e) {
    if (req.method.toLowerCase() === "get" && !req.url.includes("/api"))
      return res.redirect("/login");
    else
      return res.status(401).send({
        message: "Not logged in",
      });
  }

  next();
}

export default function MakeAuthRoutes(): Router {
  const router = Router();

  router.get("/login", async (_, res) => {
    return res.redirect(
      `https://discord.com/oauth2/authorize?client_id=${
        process.env.CLIENT_ID
      }&response_type=code&redirect_uri=${encodeURI(
        `${baseUrl}/login/callback`,
      )}&scope=identify+guilds`,
    );
  });

  router.get("/login/callback", async (req, res) => {
    try {
      const tokenResponse = await axios.post(
        "https://discord.com/api/oauth2/token",
        new URLSearchParams({
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          grant_type: "authorization_code",
          code: req.query.code as string,
          redirect_uri: `${baseUrl}/login/callback`,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      const accessToken = tokenResponse.data.access_token;

      const userResponse = await axios.get(
        "https://discord.com/api/users/@me",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const token = jwt.sign(
        {
          id: userResponse.data.id,
          username: userResponse.data.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "28d" },
      );
      res.cookie("trancer-token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 28,
        path: "/",
      });
      console.log("cookie set", token);
      return res.redirect(baseUrl);
    } catch (e) {
      console.log(e);
      return res.status(500).send({
        message: "Failed to authenticate via Discord",
      });
    }
  });

  return router;
}
