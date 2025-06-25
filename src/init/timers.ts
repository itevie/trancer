import { setInterval } from "node:timers";
import loadTs from "../util/tsLoader";
import { Timer } from "../timers/timer";
import Logger from "../util/Logger";
import { Init } from "./init";
import { client } from "..";
import config from "../config";

const timerLogger = new Logger("timers");
const init: Init = {
  whenReady: true,
  execute: async () => {
    const timers = loadTs(__dirname + "/../timers");
    const timerFrequencyMap: Record<string, Timer[]> = {};

    let isDev = client.user.id === config.devBot.id;

    // Load them all
    for await (const timer of timers) {
      const i = require(timer).default as Timer;
      if (i.noDev && isDev) continue;
      if (!timerFrequencyMap[i.every]) timerFrequencyMap[i.every] = [];
      timerFrequencyMap[i.every].push(i);
    }
    timerLogger.log(`Loaded ${timers.length} timers`);

    let run = async (timer: Timer) => {
      try {
        await timer.execute();
      } catch (e) {
        timerLogger.error(
          `Failed to run timer: ${timer.name}: ${e.toString()}`,
        );
      }
    };

    // Initially execute them all
    for (const freq in timerFrequencyMap)
      for (const timer of timerFrequencyMap[freq]) run(timer);

    // Start all the timers
    for (const freq of Object.keys(timerFrequencyMap)) {
      setInterval(() => {
        timerLogger.log(
          `Running timers of frequency ${freq}: ${timerFrequencyMap[freq].map((x) => x.name).join(", ")}`,
        );
        for (const timer of timerFrequencyMap[freq]) {
          run(timer);
        }
      }, parseInt(freq));
    }
  },
};

export default init;
