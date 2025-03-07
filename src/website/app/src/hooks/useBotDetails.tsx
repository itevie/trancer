import { useEffect, useState } from "react";
import { axiosClient } from "..";

export interface BotDetails {
  status_themes: string[];
  settings_definitions: { [key: string]: any };
}

export function useBotDetails() {
  const [botDetails, setBotDetails] = useState<BotDetails>({
    status_themes: [],
    settings_definitions: {},
  });

  useEffect(() => {
    (async () => {
      const result = await axiosClient.get("/api/bot_details");
      setBotDetails(result.data);
    })();
  }, []);

  return botDetails;
}
