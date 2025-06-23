import { units } from "../util/ms";
import { Timer } from "./timer";

const timer: Timer = {
  name: "check-birthdays",
  every: units.hour,
  execute: async () => {},
};

export default timer;
