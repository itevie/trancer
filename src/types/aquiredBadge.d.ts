import badges from "../util/badges";


interface AquiredBadge {
    user: string,
    badge_name: keyof typeof badges,
    aquired_at: string,
}