declare type BlacklistType = "category" | "command";

declare interface Blacklisted {
  type: BlacklistType;
  server_id: string;
  key: string;
}
