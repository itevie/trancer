CREATE TABLE IF NOT EXISTS spirals (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    link TEXT NOT NULL,
    sent_by TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_name TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS channel_imposition (
    channel_id TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    chance INT NOT NULL DEFAULT 70,
    every INT NOT NULL DEFAULT 10
);

CREATE TABLE IF NOT EXISTS server_settings (
    server_id TEXT NOT NULL,
    prefix TEXT NOT NULL DEFAULT '.',

    sub_role_id TEXT DEFAULT NULL,
    tist_role_id TEXT DEFAULT NULL,
    switch_role_id TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    content TEXT NOT NULL,
    author_id TEXT NOT NULL,
    message_id TEXT DEFAULT NULL,
    channel_id TEXT DEFAULT NULL,
    server_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_guessed DATETIME NOT NULL DEFAULT 0
);

-- ALTER TABLE user_imposition ADD is_bombardable BOOLEAN NOT NULL DEFAULT FALSE;
CREATE TABLE IF NOT EXISTS user_imposition (
    user_id TEXT NOT NULL,
    what TEXT NOT NULL,
    is_bombardable BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS user_favourite_spirals (
    id INT REFERENCES spirals(id) NOT NULL,
    user_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ranks (
    rank_name TEXT NOT NULL UNIQUE,
    created_by TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS votes (
    rank_name TEXT NOT NULL,
    voter TEXT NOT NULL,
    votee TEXT NOT NULL,
    voted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_data (
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    bumps INT NOT NULL DEFAULT 0,
    messages_sent INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS economy (
    user_id TEXT NOT NULL UNIQUE,
    balance INT NOT NULL DEFAULT 10,
    last_fish INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS leaderboards (
    name TEXT PRIMARY KEY NOT NULL,
    description TEXT DEFAULT 'A leaderboard'
);

CREATE TABLE IF NOT EXISTS leaderboard_entries (
    user TEXT NOT NULL,
    leaderboard TEXT NOT NULL
);