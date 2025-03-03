declare type RelationshipType =
  | "married"
  | "dating"
  | "friends"
  | "enemies"
  | "parent"
  | "owner"
  | "worships";

declare interface Relationship {
  user1: string;
  user2: string;
  type: RelationshipType;
}
