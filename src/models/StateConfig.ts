import { database } from "../util/database";

export interface DbStateConfig {
  last_backup: string | null;
  last_lottery: string | null;
  last_qotd: string | null;
}

export default class StateConfig {
  public lastBackup: Date;
  public lastLottery: Date;
  public lastQotd: Date;

  public constructor(public data: DbStateConfig) {
    this.lastBackup = new Date(data.last_backup ?? "0");
    this.lastLottery = new Date(data.last_lottery ?? "0");
    this.lastQotd = new Date(data.last_qotd ?? "0");
  }

  public static async set<T extends keyof DbStateConfig>(
    key: T,
    value: DbStateConfig[T],
  ): Promise<void> {
    await database.run(`UPDATE config SET ${key} = ?;`, value);
  }

  public static async fetch(): Promise<StateConfig> {
    let result = await database.get<DbStateConfig>("SELECT * FROM config;");
    if (!result) {
      result = await database.get<DbStateConfig>(
        "INSERT INTO config DEFAULT VALUES RETURNING *",
      );
    }

    return new StateConfig(result);
  }
}
