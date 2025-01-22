import { database } from "../database";

export async function channelHasAutoImposition(
  channelId: string
): Promise<boolean> {
  return (
    (
      await database.all(
        `SELECT * FROM channel_imposition WHERE channel_id = (?)`,
        channelId
      )
    ).length !== 0
  );
}

export async function setupAutoImposition(channelId: string): Promise<void> {
  if (!(await channelHasAutoImposition(channelId)))
    await database.run(
      `INSERT INTO channel_imposition (channel_id) VALUES (?)`,
      channelId
    );
}

export async function setAutoImpositionEnabled(
  channelId: string,
  newValue: boolean
): Promise<void> {
  await database.run(
    `UPDATE channel_imposition SET is_enabled = (?) WHERE channel_id = (?);`,
    newValue,
    channelId
  );
}

export async function setAutoImpositionChannel(
  channelId: string,
  newValue: number
): Promise<void> {
  await database.run(
    `UPDATE channel_imposition SET chance = (?) WHERE channel_id = (?);`,
    newValue,
    channelId
  );
}

export async function setAutoImpositionEvery(
  channelId: string,
  newValue: number
): Promise<void> {
  await database.run(
    `UPDATE channel_imposition SET every = (?) WHERE channel_id = (?);`,
    newValue,
    channelId
  );
}

export async function getChannelAutoImposition(
  channelId: string
): Promise<ChannelImposition | undefined> {
  return await database.get(
    `SELECT * FROM channel_imposition WHERE channel_id = (?);`,
    channelId
  );
}

// ----- User Specific -----
export async function addTriggerFor(
  userId: string,
  what: string,
  isBombard: boolean
): Promise<void> {
  await database.run(
    `INSERT INTO user_imposition (user_id, what, is_bombardable) VALUES ((?), (?), (?))`,
    userId,
    what,
    isBombard
  );
}

export async function getTriggersFor(
  userId: string
): Promise<UserImposition[]> {
  return await database.all(
    `SELECT * FROM user_imposition WHERE user_id = (?)`,
    userId
  );
}
