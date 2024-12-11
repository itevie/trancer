import { database } from "../database";

export async function userDataExists(
  userId: string,
  guildId: string
): Promise<boolean> {
  return (
    (
      await database.all(
        `SELECT * FROM user_data WHERE user_id = (?) AND guild_id = (?);`,
        userId,
        guildId
      )
    ).length !== 0
  );
}

export async function createUserData(
  userId: string,
  guildId: string
): Promise<UserData> {
  return await database.get<UserData>(
    `INSERT INTO user_data (user_id, guild_id) VALUES ((?), (?)) RETURNING *;`,
    userId,
    guildId
  );
}

export async function addBump(userId: string, guildId: string): Promise<void> {
  await database.run(
    `UPDATE user_data SET bumps = bumps + 1 WHERE user_id = (?) AND guild_id = (?);`,
    userId,
    guildId
  );
}

export async function addMessageSent(
  userId: string,
  guildId: string
): Promise<void> {
  await database.run(
    `UPDATE user_data SET messages_sent = messages_sent + 1 WHERE user_id = (?) AND guild_id = (?);`,
    userId,
    guildId
  );
}

export async function getUserData(
  userId: string,
  guildId: string
): Promise<UserData> {
  let result = (
    await database.all(
      `SELECT * FROM user_data WHERE user_id = (?) AND guild_id = (?);`,
      userId,
      guildId
    )
  )[0] as UserData;

  if (!result) result = await createUserData(userId, guildId);
  return result;
}

export async function getAllGuildsUserData(
  guildId: string
): Promise<UserData[]> {
  return (await database.all(
    `SELECT * FROM user_data WHERE guild_id = (?);`,
    guildId
  )) as UserData[];
}

export async function addXP(
  userId: string,
  guildId: string,
  amount: number
): Promise<void> {
  await database.run(
    "UPDATE user_data SET xp = xp + ? WHERE user_id = ? AND guild_id = ?;",
    amount,
    userId,
    guildId
  );
}
