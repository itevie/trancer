import sqlite3, { Statement } from "sqlite3";
import { Database, open } from "sqlite";
import * as path from "path";
import * as fs from "fs";
import config from "../config";
import Logger from "./Logger";

import userData from "./db-parts/userData";
import spirals from "./db-parts/spirals";
import serverSettings from "./db-parts/serverSettings";
import items from "./db-parts/items";
import triggers from "./db-parts/triggers";
import qotd from "./db-parts/qotd";
import quotes from "./db-parts/quotes";
import cards from "./db-parts/cards";
import decks from "./db-parts/decks";
import giveaways from "./db-parts/giveaways";
import relationships from "./db-parts/relationships";
import reports from "./db-parts/reports";
import blacklist from "./db-parts/blacklist";
import badges from "./db-parts/badges";
import serverCount from "./db-parts/serverCount";
import dawnagotchi from "./db-parts/dawnagotchi";
import ranks from "./db-parts/ranks";
import ratelimits from "./db-parts/ratelimits";
import eco from "./db-parts/economy";
import oneWordStories from "./db-parts/oneWordStories";
import commandCreations from "./db-parts/commandCreations";
import triggerIdeas from "./db-parts/triggerIdeas";
import confessions from "./db-parts/confessions";
import missions from "./db-parts/missions";
import wordUsage from "./db-parts/wordUsage";
import { units } from "./ms";

export let database: Database<sqlite3.Database, Statement>;
export const databaseLogger = new Logger("database");

export const actions = {
  userData,
  spirals,
  serverSettings,
  items,
  triggers,
  qotd,
  quotes,
  cards,
  decks,
  giveaways,
  relationships,
  reports,
  blacklist,
  badges,
  serverCount,
  dawnagotchi,
  ranks,
  ratelimits,
  eco,
  oneWordStories,
  commandCreations,
  triggerIdeas,
  confessions,
  wordUsage,
  missions,
} as const;

export function cached<T extends (...args: unknown[]) => Promise<any>>(
  f: T,
  period?: number,
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  const cache: Map<string, { time: number; data: Awaited<ReturnType<T>> }> =
    new Map();

  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const key = JSON.stringify(args);

    if (
      !cache.has(key) ||
      Date.now() - cache.get(key).time >= (period ?? units.hour)
    ) {
      let value = await f(...args);
      cache.set(key, { time: Date.now(), data: value });
      return value;
    }

    return cache.get(key).data;
  };
}

let nameCache: Map<string, any> = new Map();
export async function keyedCache<
  T extends (...args: unknown[]) => Promise<any>,
>(key: string, f: T): Promise<Awaited<ReturnType<T>>> {
  if (
    !nameCache.has(key) ||
    Date.now() - nameCache.get(key).time >= units.hour
  ) {
    let value = await f();
    nameCache.set(key, { time: Date.now(), data: value });
    return value;
  }

  return nameCache.get(key).data;
}

export async function connect(): Promise<void> {
  // This is relative to the config file
  const databasePath = path.join(config.database.location);

  try {
    // Create database
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    // Setup
    await database.exec(
      fs.readFileSync(path.join(__dirname + "/../sql/setup.sql"), "utf-8"),
    );

    // Init
    for await (const action of Object.values(actions)) {
      // @ts-ignore
      if ("_init" in action) await action._init();
    }
  } catch (e) {
    console.error(e);
    console.log(`Failed to load database.`);
    process.exit();
  }

  databaseLogger.log("Database successfully opened");
}
