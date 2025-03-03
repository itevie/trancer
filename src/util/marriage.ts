export function englishifyRelationship(type: RelationshipType) {
  return {
    dating: "date",
    married: "partner",
    friends: "friend",
    enemies: "enemy",
    parent: "child",
    worships: "deity",
    owner: "pet",
  }[type];
}

export const marriageEmojis: Record<RelationshipType, string> = {
  dating: ":purple_heart:",
  married: ":pink_heart:",
  friends: ":green_heart:",
  enemies: ":red_heart:",
  worships: ":grey_heart:",
  parent: ":yellow_heart:",
  owner: ":light_blue_heart:",
};

export const colorMap: Record<RelationshipType, string> = {
  married: "pink",
  dating: "purple",
  friends: "green",
  enemies: "red",
  parent: "yellow",
  worships: "grey",
  owner: "blue",
};

export function relationshipArrayToEmojiArray(
  relationships: Relationship[]
): string[] {
  return relationships.map((x) => marriageEmojis[x.type]).sort();
}
