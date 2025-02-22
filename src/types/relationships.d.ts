declare type RelationshipType =
  | "married"
  | "dating"
  | "friends"
  | "enemies"
  | "parent"
  | "worships";

declare interface Relationship {
  user1: string;
  user2: string;
  type: RelationshipType;
}
