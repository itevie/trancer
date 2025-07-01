import { database } from "../util/database";

export interface DbHugeAlias {
  user_id: string;
  command: string;
  result: string;
}

export default class HugeAlias {
  public constructor(public data: DbHugeAlias) {}

  public async delete() {
    await database.run(
      "DELETE FROM huge_aliases WHERE user_id = ? AND command = ?",
      this.data.user_id,
      this.data.command,
    );
  }

  public static async fetchAll(userId: string): Promise<HugeAlias[]> {
    const result = await database.all<DbHugeAlias[]>(
      "SELECT * FROM huge_aliases WHERE user_id = ?",
      userId,
    );
    return result.map((x) => new HugeAlias(x));
  }

  public static async fetch(
    userId: string,
    command: string,
  ): Promise<HugeAlias | null> {
    const result = await database.get<DbHugeAlias>(
      "SELECT * FROM huge_aliases WHERE user_id = ? AND command = ?",
      userId,
      command,
    );
    if (!result) return null;

    return new HugeAlias(result);
  }

  public static async create(
    userId: string,
    command: string,
    result: string,
  ): Promise<HugeAlias> {
    return new HugeAlias(
      await database.get<DbHugeAlias>(
        "INSERT INTO huge_aliases (user_id, command, result) VALUES (?, ?, ?) RETURNING *",
        userId,
        command,
        result,
      ),
    );
  }
}
