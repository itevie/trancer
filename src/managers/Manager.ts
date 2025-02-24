import Logger from "../util/Logger";

const logger = new Logger("manager");

export default abstract class Manager {
  public abstract name: string;
  public abstract init(): Promise<boolean>;
  public abstract update(): Promise<void>;
}

export async function startManagers(managers: Manager[]): Promise<void> {
  const exlude: string[] = [];
  for await (const manager of managers) {
    const result = await manager.init();
    if (!result) {
      exlude.push(manager.name);
      logger.log(`Manager ${manager.name} failed, excluding`);
    } else {
      logger.log(`Initialised manager ${manager.name}`);
    }
  }

  setInterval(async () => {
    for await (const manager of managers) {
      await manager.update();
    }
  }, 60_000);
}
