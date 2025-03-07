import { useEffect, useState } from "react";
import { axiosClient } from "..";

export interface Server {
  id: string;
  name: string;
  avatar: string;
  can_manage: boolean;
}

export function useServers() {
  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    (async () => {
      const result = await axiosClient.get("/api/servers");
      setServers(result.data);
    })();
  }, []);

  return servers;
}
