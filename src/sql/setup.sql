CREATE TABLE IF NOT EXISTS spirals (
    link TEXT NOT NULL,
    sent_by TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    server_id TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_guessed DATETIME NOT NULL DEFAULT 0 
);