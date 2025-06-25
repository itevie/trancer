import { existsSync, writeFileSync, readFileSync } from "fs";
import path from "path";
import { createBackup } from "../util/other";
import Logger from "../util/Logger";

const logger = new Logger("backup");

() => {
  // Backup
  let lastBackup = 0;
  let loc = path.normalize(path.resolve(__dirname, "../last_backup.txt"));
  if (!existsSync(loc)) writeFileSync(loc, "0");
  lastBackup = new Date(readFileSync(loc, "utf-8")).getTime();

  if (8.64e7 - (Date.now() - lastBackup) < 0) {
    createBackup();
    logger.log(`Created backup!`);
    writeFileSync(loc, Date.now().toString());
  }
};

export default () => {};
