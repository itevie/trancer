interface UserData {
  user_id: string;
  guild_id: string;
  bumps: number;
  messages_sent: number;
  vc_time: number;
  xp: number;
  site_quote_opt_in: boolean;
  ttt_win: number;
  ttt_lose: number;
  ttt_tie: number;
  c4_win: number;
  c4_lose: number;
  c4_tie: number;
  allow_requests: boolean;
  allow_triggers: boolean;
  count_ruined: number;
  hypno_status: "red" | "yellow" | "green";
  relationships: boolean;
  count_banned: boolean;
  birthday: string | null;
  talking_streak: number;
  last_talking_streak: string;
  highest_talking_streak: number;
}

interface PinnedRating {
  user_id: string;
  rating: string;
}
