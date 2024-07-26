interface Leaderboard {
    name: string,
    description: string,
    for_server: string | null,
}

interface LeaderboardEntry {
    user: string,
    leaderboard: string,
}