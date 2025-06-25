import { units } from "../util/ms";
import { Timer } from "./timer";

const timer: Timer = {
  name: "check-birthdays",
  every: units.hour,
  noDev: true,
  execute: async () => {},
};

export default timer;
