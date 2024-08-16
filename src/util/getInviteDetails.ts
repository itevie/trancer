import { Client } from "discord.js";

interface InviterDetails {
    inviteCode: string | null,
    inviterId: string | null,
}

export default async function getInviteDetails(client: Client, serverId: string, memberId: string): Promise<InviterDetails | null> {
    // Stolen from F11 network tab of the members tab in the discord client, cause discord.js is a twat and doesn't show it
    let result = (await client.rest.post(`/guilds/${serverId}/members-search`, {
        body: {
            and_query: {
                user_id: {
                    or_query: [
                        memberId
                    ]
                }
            }
        }
    }) as any).members[0] as { source_invite_code: string | null, inviter_id: string | null } | undefined;

    return {
        inviteCode: result.source_invite_code,
        inviterId: result.inviter_id,
    };
}