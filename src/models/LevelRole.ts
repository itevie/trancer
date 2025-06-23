import { database } from "../util/database";

export interface DbLevelRole {
  server_id: string;
  role_id: string | null;
  level: number;
}

export default class LevelRole {
  public constructor(public data: DbLevelRole) {}

  public async delete(): Promise<void> {
    await database.run(
      "DELETE FROM level_roles WHERE server_id = ? AND role_id = ? AND level = ?",
      this.data.server_id,
      this.data.role_id,
      this.data.level,
    );
  }

  public static async deleteAll(serverId: string): Promise<void> {
    await database.run("DELETE FROM level_roles WHERE server_id = ?", serverId);
  }

  public static async fetchAll(serverId: string): Promise<LevelRole[]> {
    return (
      await database.all<DbLevelRole[]>(
        "SELECT * FROM level_roles WHERE server_id = ?",
        serverId,
      )
    ).map((x) => new LevelRole(x));
  }

  public static async fetch(
    serverId: string,
    roleId: string,
    level: number,
  ): Promise<LevelRole | null> {
    let data = await database.get<DbLevelRole>(
      "SELECT * FROM level_roles WHERE server_id = ? AND role_id = ? AND level = ?",
      serverId,
      roleId,
      level,
    );
    if (!data) return null;
    return new LevelRole(data);
  }

  public static async create(
    serverId: string,
    roleId: string,
    level: number,
  ): Promise<LevelRole> {
    return new LevelRole(
      await database.get<DbLevelRole>(
        "INSERT INTO level_roles (server_id, role_id, level) VALUES (?, ?, ?) RETURNING *",
        serverId,
        roleId,
        level,
      ),
    );
  }

  toJSON() {
    return this.data;
  }
}
