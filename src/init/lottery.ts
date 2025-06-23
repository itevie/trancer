import { existsSync, writeFileSync } from "fs";
import { lotteryFileLocation } from "../managers/lottery";

export default function () {
  if (!existsSync(lotteryFileLocation))
    writeFileSync(lotteryFileLocation, new Date().toISOString());
}
