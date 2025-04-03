CREATE TABLE IF NOT EXISTS money_transactions (
    id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id TEXT NOT NULL,
    balance INTEGER NOT NULL,
    added_at INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS command_usage (
    command_name TEXT UNIQUE NOT NULL,
    used INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages_at_time (
    time TEXT UNIQUE NOT NULL,
    amount INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS messages_in_channels (
    channel_id TEXT UNIQUE PRIMARY KEY NOT NULL,
    guild_id TEXT NOT NULL,
    amount INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS message_at_time_specific (
    time TEXT UNIQUE NOT NULL,
    channel_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    amount INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS word_usage (
    word TEXT NOT NULL UNIQUE,
    amount INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS member_count (
    id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
    time TEXT NOT NULL,
    server_id TEXT NOT NULL,
    amount INT NOT NULL
);

CREATE TABLE IF NOT EXISTS word_usage (
    word TEXT NOT NULL,
    amount INT NOT NULL DEFAULT 0,
    date TEXT NOT NULL
);
