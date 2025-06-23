import { units } from "../util/ms";
import { Timer } from "./timer";

const timer: Timer = {
  name: "check-level-roles",
  every: units.day,
  execute: async () => {
    // TODO: Make it check them
    // Maybe on LevelRole there should be a checkServer() or something
  },
};

export default timer;
