import { setInterval } from "node:timers";
import loadTs from "../util/tsLoader";
import { Timer } from "../timers/timer";
import Logger from "../util/Logger";

const timerLogger = new Logger("timers");
export default async function initTimers() {
  const timers = loadTs(__dirname + "/../timers");
  const timerFrequencyMap: Record<string, Timer[]> = {};

  // Load them all
  for await (const timer of timers) {
    const i = require(timer).default as Timer;
    if (!timerFrequencyMap[i.every]) timerFrequencyMap[i.every] = [];
    timerFrequencyMap[i.every].push(i);
  }
  timerLogger.log(`Loaded ${timers.length} timers`);

  // Initially execute them all
  for (const freq in timerFrequencyMap)
    for (const timer of timerFrequencyMap[freq]) timer.execute();

  // Start all the timers
  for (const freq of Object.keys(timerFrequencyMap)) {
    setInterval(() => {
      timerLogger.log(
        `Running timers of requency ${freq}: ${timerFrequencyMap[freq].map((x) => x.name).join(", ")}`,
      );
      for (const timer of timerFrequencyMap[freq]) {
        timer.execute();
      }
    }, parseInt(freq));
  }
}
