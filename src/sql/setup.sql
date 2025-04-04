CREATE TABLE IF NOT EXISTS server_settings (
    server_id TEXT NOT NULL,
    prefix TEXT NOT NULL DEFAULT '.',
    last_bump INT NOT NULL DEFAULT 0,
    last_bumper TEXT DEFAULT NULL,
    bump_reminded BOOLEAN DEFAULT false,
    sub_role_id TEXT DEFAULT NULL,
    tist_role_id TEXT DEFAULT NULL,
    switch_role_id TEXT DEFAULT NULL,
    invite_logger_channel_id TEXT DEFAULT NULL,
    quotes_channel_id TEXT DEFAULT NULL,
    remind_bumps BOOLEAN DEFAULT false,
    bump_channel TEXT DEFAULT NULL,
    level_notifications BOOLEAN DEFAULT true,
    auto_ban_keywords TEXT NOT NULL,
    auto_ban_enabled BOOLEAN DEFAULT false,
    auto_ban_count INT NOT NULL DEFAULT 0,
    report_channel TEXT DEFAULT null,
    report_trusted BOOLEAN NOT NULL DEFAULT false,
    report_ban_log_channel TEXT DEFAULT null,
    status_theme TEXT NOT NULL DEFAULT 'circles',
    unverified_role_id TEXT DEFAULT NULL,
    verification_role_id TEXT DEFAULT NULL,
    verified_string TEXT DEFAULT '{mention} has been verified! Welcome!',
    verified_channel_id TEXT DEFAULT NULL,
    welcome_channel_id TEXT DEFAULT NULL,
    welcome_message TEXT NOT NULL DEFAULT '{mention} joined our server! We now have {member_count} members!',
    leave_channel_id TEXT DEFAULT NULL,
    leave_message TEXT NOT NULL DEFAULT '**{username}** left our server :( We now have {member_count} members',
    allow_nsfw_file_directory_sources BOOLEAN NOT NULL DEFAULT false,
    confessions_channel_id TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS trigger_ideas (
    id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
    added_by TEXT NOT NULL,
    added_at TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    UNIQUE (name, description)
);

CREATE TABLE IF NOT EXISTS blacklisted (
    server_id TEXT NOT NULL,
    type TEXT NOT NULL,
    key TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS star_board (
    server_id TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '⭐',
    minimum INTEGER NOT NULL DEFAULT 3,
    channel_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS star_board_messages (
    message_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    star_board_message_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS channel_imposition (
    channel_id TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    chance INT NOT NULL DEFAULT 70,
    every INT NOT NULL DEFAULT 10
);

CREATE TABLE IF NOT EXISTS server_count (
    server_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    current_count INT NOT NULL DEFAULT 0,
    last_counter TEXT DEFAULT NULL,
    highest_count INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS role_menus (
    id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
    server_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT NULL,
    attached_to TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS role_menu_items (
    id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
    menu_id INTEGER REFERENCES role_menu (id),
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    role_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS qotd_questions (
    id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
    server_id INTEGER NOT NULL,
    suggestor INTEGER NOT NULL,
    question TEXT NOT NULL,
    asked BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (server_id, question)
);

CREATE TABLE IF NOT EXISTS giveaways (
    id TEXT UNIQUE PRIMARY KEY NOT NULL,
    what TEXT NOT NULL,
    message_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    min_level INT
);

CREATE TABLE IF NOT EXISTS giveaway_entries (
    giveaway_id TEXT REFERENCES giveaways (id) NOT NULL,
    author_id TEXT NOT NULL,
    UNIQUE (giveaway_id, author_id)
);

CREATE TABLE IF NOT EXISTS reports (
    id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
    user TEXT NOT NULL,
    author TEXT NOT NULL,
    server TEXT NOT NULL,
    reason TEXT NOT NULL,
    attachments TEXT NOT NULL,
    created_at TET NOT NULL
);

CREATE TABLE IF NOT EXISTS one_word_stories (
    id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
    guild_id TEXT NOT NULL,
    sentence TEXT NOT NULL DEFAULT '',
    done BOOLEAN NOT NULL DEFAULT false,
    last_user TEXT DEFAULT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS command_creations (
    name TEXT UNIQUE PRIMARY KEY NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS confessions (
    id INTEGER UNIQUE PRIMARY KEY AUTOINCREMENT NOT NULL,
    user_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- User specific stuff
CREATE TABLE IF NOT EXISTS user_imposition (
    user_id TEXT NOT NULL,
    what TEXT NOT NULL,
    is_bombardable BOOLEAN NOT NULL DEFAULT FALSE,
    tags TEXT NOT NULL DEFAULT 'green;yellow;bombard;by others'
);

CREATE TABLE IF NOT EXISTS user_trusted_tists (
    user_id TEXT NOT NULL,
    trusted_user_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_favourite_spirals (
    id INT REFERENCES spirals (id) NOT NULL,
    user_id TEXT NOT NULL
);

ALTER TABLE user_data ADD birthday TEXT DEFAULT NULL;

CREATE TABLE IF NOT EXISTS user_data (
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    bumps INT NOT NULL DEFAULT 0,
    messages_sent INT NOT NULL DEFAULT 0,
    vc_time INT NOT NULL DEFAULT 0,
    xp INT NOT NULL DEFAULT 0,
    site_quote_opt_in BOOLEAN DEFAULT true,
    ttt_win INT NOT NULL DEFAULT 0,
    ttt_lose INT NOT NULL DEFAULT 0,
    ttt_tie INT NOT NULL DEFAULT 0,
    c4_win INT NOT NULL DEFAULT 0,
    c4_lose INT NOT NULL DEFAULT 0,
    c4_tie INT NOT NULL DEFAULT 0,
    allow_requests BOOLEAN NOT NULL DEFAULT true,
    allow_triggers BOOLEAN NOT NULL DEFAULT true,
    count_ruined INT NOT NULL DEFAULT 0,
    auto_sell BOOLEAN NOT NULL DEFAULT false,
    hypno_status TEXT NOT NULL DEFAULT 'green',
    relationships BOOL NOT NULL DEFAULT true,
    count_banned BOOLEAN NOT NULL DEFAULT false,
    birthday TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS pinned_ratings (user_id TEXT NOT NULL, rating TEXT NOT NULL);

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

CREATE TABLE IF NOT EXISTS aquired_badges (
    user TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    date_aquired DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aquired_items (
    item_id INTEGER REFERENCES items (id),
    user_id TEXT NOT NULL,
    amount INT NOT NULL DEFAULT 0,
    protected BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS aquired_cards (
    card_id INTEGER REFERENCES cards (id),
    user_id TEXT NOT NULL,
    amount INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS votes (
    rank_name TEXT NOT NULL,
    voter TEXT NOT NULL,
    votee TEXT NOT NULL,
    voted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ratelimits (
    command TEXT NOT NULL,
    user_id TEXT NOT NULL,
    last_used TEXT NOT NULL,
    UNIQUE (user_id, command)
);

CREATE TABLE IF NOT EXISTS relationships (
    user1 TEXT NOT NULL,
    user2 TEXT NOT NULL,
    type TEXT NOT NULL
);

-- Global stuff
CREATE TABLE IF NOT EXISTS spirals (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    link TEXT NOT NULL,
    sent_by TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_name TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    content TEXT NOT NULL,
    author_id TEXT NOT NULL,
    message_id TEXT DEFAULT NULL,
    channel_id TEXT DEFAULT NULL,
    server_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT NLL,
    last_guessed DATETIME NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ranks (
    rank_name TEXT NOT NULL UNIQUE,
    created_by TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS economy (
    user_id TEXT NOT NULL UNIQUE,
    balance INT NOT NULL DEFAULT 0,
    last_fish INT NOT NULL DEFAULT 0,
    last_daily INT NOT NULL DEFAULT 0,
    last_dawn_care INT NOT NULL DEFAULT 0,
    last_dawn_care_all_100 INT NOT NULL DEFAULT 0,
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

CREATE TABLE IF NOT EXISTS leaderboard_entries (user TEXT NOT NULL, leaderboard TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS decks (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL DEFAULT "A card deck"
);

CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    deck INT NOT NULL REFERENCES decks (ID),
    description TEXT DEFAULT NULL,
    name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    link TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT "uncommon",
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    price INT NOT NULL,
    description TEXT DEFAULT NULL,
    weight REAL NOT NULL DEFAULT 0.5,
    droppable BOOLEAN NOT NULL DEFAULT false,
    tag TEXT DEFAULT NULL,
    buyable BOOLEAN NOT NULL DEFAULT true,
    emoji TEXT DEFAULT NULL,
    max INT DEFAULT NULL
);
