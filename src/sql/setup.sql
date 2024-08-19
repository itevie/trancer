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
    last_bump INT NOT NULL DEFAULT 0,
    last_bumper TEXT DEFAULT NULL,
    bump_reminded BOOLEAN DEFAULT false,

    sub_role_id TEXT DEFAULT NULL,
    tist_role_id TEXT DEFAULT NULL,
    switch_role_id TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS server_count (
    server_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    current_count INT NOT NULL DEFAULT 0,
    last_counter TEXT DEFAULT NULL,
    highest_count INT NOT NULL DEFAULT 0
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
    messages_sent INT NOT NULL DEFAULT 0,
    vc_time INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS economy (
    user_id TEXT NOT NULL UNIQUE,
    balance INT NOT NULL DEFAULT 10,
    last_fish INT NOT NULL DEFAULT 0,
    last_daily INT NOT NULL DEFAULT 0,
    last_dawn_care INT NOT NULL DEFAULT 0,
    from_messaging INT NOT NULL DEFAULT 0,
    from_vc INT NOT NULL DEFAULT 0,
    from_commands INT NOT NULL DEFAULT 0,
    from_helping INT NOT NULL DEFAULT 0,
    from_gambling INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS leaderboards (
    name TEXT PRIMARY KEY NOT NULL,
    description TEXT DEFAULT 'A leaderboard'
);

CREATE TABLE IF NOT EXISTS leaderboard_entries (
    user TEXT NOT NULL,
    leaderboard TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS aquired_badges (
    user TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    date_aquired DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decks (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL DEFAULT "A card deck"
);

CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    deck INT NOT NULL REFERENCES decks(ID),
    description TEXT DEFAULT NULL,
    name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    link TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT "uncommon",
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aquired_cards (
    card_id INTEGER REFERENCES cards(id),
    user_id TEXT NOT NULL,
    amount INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    price INT NOT NULL,
    description TEXT DEFAULT NULL,
    droppable BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS aquired_items (
    item_id INTEGER REFERENCES items(id),
    user_id TEXT NOT NULL,
    amount INT NOT NULL DEFAULT 0
);

-- ALTER TABLE dawnagotchi ADD alive BOOLEAN NOT NULL DEFAULT true;
CREATE TABLE IF NOT EXISTS dawnagotchi (
    id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
    owner_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    hair_color_hex TEXT NOT NULL DEFAULT '#FFB6C1',

    alive BOOLEAN NOT NULL DEFAULT true,

    next_feed INT NOT NULL DEFAULT 0,
    next_drink INT NOT NULL DEFAULT 0,
    next_play INT NOT NULL DEFAULT 0
);