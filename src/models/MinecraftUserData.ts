import { database } from "../util/database";
import { McAuthBody } from "../website/routes/api/minecraftRoutes";

export interface DbMinecraftUsetData {
  user_id: string;
  uuid: string;
  username: string;
}

export default class MinecraftUserData {
  constructor(public data: DbMinecraftUsetData) {}

  public static async getByUserId(
    userId: string,
  ): Promise<MinecraftUserData | null> {
    let result = await database.get<DbMinecraftUsetData>(
      "SELECT * FROM minecraft_user_data WHERE user_id = ?",
      userId,
    );
    return !result ? null : new MinecraftUserData(result);
  }

  public static async getByUuid(
    uuid: string,
  ): Promise<MinecraftUserData | null> {
    let result = await database.get<DbMinecraftUsetData>(
      "SELECT * FROM minecraft_user_data WHERE uuid = ?",
      uuid,
    );
    return !result ? null : new MinecraftUserData(result);
  }

  public static async authenticate(
    userId: string,
    body: McAuthBody,
  ): Promise<MinecraftUserData> {
    return new MinecraftUserData(
      await database.get<DbMinecraftUsetData>(
        "INSERT INTO minecraft_user_data(user_id, uuid, username) VALUES (?, ?, ?) RETURNING *;",
        userId,
        body.uuid,
        body.username,
      ),
    );
  }
}
