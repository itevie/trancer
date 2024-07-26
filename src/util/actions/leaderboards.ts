import { database } from "../database";

export async function leaderboardExists(name: string): Promise<boolean> {
    return (await database.all(`SELECT * FROM leaderboards WHERE name = (?);`, name)).length !== 0;
}

export async function createLeaderboard(name: string): Promise<void> {
    await database.run(`INSERT INTO leaderboards (name) VALUES ((?))`, name);
}

export async function insertLeaderboardEntry(user: string, leaderboard: string): Promise<void> {
    await database.run(`INSERT INTO leaderboard_entries (user, leaderboard) VALUES ((?), (?))`, user, leaderboard);
}

export async function getEntriesForLeaderboard(leaderboard: string): Promise<LeaderboardEntry[]> {
    return (await database.all(`SELECT * FROM leaderboard_entries WHERE leaderboard = (?);`, leaderboard)) as LeaderboardEntry[];
}