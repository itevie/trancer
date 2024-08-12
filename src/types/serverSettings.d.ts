interface ServerSettings {
    server_id: string,
    prefix: string,

    last_bump: number,
    bump_reminded: boolean,
    last_bumper: string | null,

    sub_role_id: string,
    tist_role_id: string,
    switch_role_id: string,
}