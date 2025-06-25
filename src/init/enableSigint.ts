import { client, deinits } from "..";
import Logger from "../util/Logger";
import { Init } from "./init";

const logger = new Logger("deinit");
const init: Init = {
  whenReady: true,
  priority: -10,
  execute() {
    process.on("SIGINT", async () => {
      const steps = [
        async () => {
          await client.destroy();
        },
        ...deinits,
      ];
      const progress = logger.logProgress("Deinit", steps.length);
      for await (const part of steps) {
        try {
          await part();
        } catch (e) {
          logger.error(`Failed to deinit something: `, e);
        } finally {
          progress();
        }
      }
      progress(true);
      process.exit(1);
    });
  },
};

export default init;
