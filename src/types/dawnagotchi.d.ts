interface Dawnagotchi {
    id: number,
    owner_id: string,
    created_at: Date,

    hair_color_hex: string,

    alive: boolean,

    next_feed: Date,
    next_drink: Date,
    next_play: Date
}