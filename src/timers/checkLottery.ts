import { checkLottery } from "../managers/lottery";
import { units } from "../util/ms";
import { Timer } from "./timer";

const timer: Timer = {
  name: "check-lottery",
  every: units.minute,
  execute: () => {
    checkLottery();
  },
};

export default timer;
