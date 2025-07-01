import { Message } from "discord.js";
import { database } from "../util/database";

export interface DbServerCount {
  server_id: string;
  channel_id: string;
  current_count: number;
  last_counter: string | null;
  highest_count: number;
  ignore_failure: boolean;
  ignore_failure_weekends: boolean;
}

export interface DbServerCountRuin {
  server_id: string;
  channel_id: string;
  count: number;
  ruined_at: string;
}

export default class ServerCount {
  public constructor(public data: DbServerCount) {}

  public async increase(by: string): Promise<void> {
    let count = await database.get<DbServerCount>(
      "UPDATE server_count SET current_count = current_count + 1, last_counter = ? WHERE server_id = ? RETURNING *",
      by,
      this.data.server_id,
    );

    if (count.current_count > this.data.highest_count)
      await database.run(
        `update server_count set highest_count = ? where server_id = ?`,
        count.current_count,
        count.server_id,
      );
  }

  public async ruined(by: string, message?: Message): Promise<void> {
    await database.run(
      "INSERT INTO server_count_ruins (server_id, channel_id, count, ruined_at) VALUES (?, ?, ?, ?)",
      this.data.server_id,
      this.data.channel_id,
      this.data.highest_count,
      new Date().toISOString(),
    );

    await database.run(
      `UPDATE server_count SET current_count = 0 WHERE server_id = ?`,
      this.data.server_id,
    );

    const userData = await database.get<UserData>(
      `UPDATE user_data SET count_ruined = count_ruined + 1 WHERE user_id = ? AND guild_id = ? RETURNING *;`,
      by,
      this.data.server_id,
    );

    if (userData.count_ruined >= 5) {
      await database.run(
        "UPDATE user_data SET count_banned = true WHERE user_id = ? AND guild_id = ?",
        message.author.id,
        this.data.server_id,
      );
      await message.reply(
        `:warning: You have been banned from counting since you have ruined the count more than 5 times! You must buy a count unban with \`.unbancount\``,
      );
    }
  }

  public static async get(serverId: string): Promise<ServerCount | null> {
    const result = await database.get<DbServerCount>(
      "SELECT * FROM server_count WHERE server_id = ?",
      serverId,
    );

    return result ? new ServerCount(result) : null;
  }
}
