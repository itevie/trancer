interface ServerSettings {
  server_id: string;
  prefix: string;

  last_bump: number;
  bump_reminded: boolean;
  last_bumper: string | null;

  sub_role_id: string | null;
  tist_role_id: string | null;
  switch_role_id: string | null;

  unverified_role_id: string | null;
  verification_role_id: string | null;
  verified_string: string | null;
  verified_channel_id: string | null;

  welcome_channel_id: string | null;
  welcome_message: string;
  leave_channel_id: string | null;
  leave_message: string;

  quotes_channel_id: string | null;
  invite_logger_channel_id: string | null;
  remind_bumps: boolean;
  bump_channel: string | null;
  level_notifications: boolean;

  auto_ban_keywords: string;
  auto_ban_enabled: string;
  auto_ban_count: number;

  report_channel: string | null;
  report_trusted: boolean;
  report_ban_log_channel: string | null;

  status_theme: string;

  allow_nsfw_file_directory_sources: boolean;

  confessions_channel_id: string | null;
}

interface ChannelImposition {
  channel_id: string;
  is_enabled: boolean;
  every: number;
  chance: number;
}

interface ServerCount {
  server_id: string;
  channel_id: string;
  last_counter: string;
  current_count: number;
  highest_count: number;
}

interface RoleMenu {
  id: number;
  server_id: string;
  name: string;
  description: string;
  attached_to: string | null;
}

interface RoleMenuItem {
  id: number;
  menu_id: number;
  name: string;
  emoji: string;
  role_id: string;
}
