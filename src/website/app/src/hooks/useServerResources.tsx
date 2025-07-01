import { useEffect, useState } from "react";
import { axiosClient } from "..";

export interface ServerChannel {
  id: string;
  name: string;
  parent: string;
}

export interface ServerRole {
  id: string;
  name: string;
  color: number;
  permissions: number;
}

export interface LevelRole {
  server_id: string;
  role_id: string | null;
  level: number;
}

type ServerResources = {
  channels: ServerChannel[];
  roles: ServerRole[];
  settings: { [key: string]: string };
  raw_settings: ServerSettings;
  level_roles: LevelRole[];
};

export default function useServerResources(id: string) {
  const [resources, setResources] = useState<ServerResources>({
    channels: [],
    roles: [],
    settings: {},
    raw_settings: {} as ServerSettings,
    level_roles: [],
  });

  const [modified, setModified] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    (async () => {
      const result = await axiosClient.get(`/api/servers/${id}/resources`);
      setResources(result.data);
    })();
  }, []);

  return {
    resources,
    modified,

    addModified(key: string, value: string) {
      setModified((old) => {
        return {
          ...old,
          [key]: (value === "%%%null" ? null : value) as string,
        };
      });
    },

    async save() {
      const settings = { ...modified };
      await axiosClient.post(`/api/servers/${id}/settings`, settings);
      setResources((old) => {
        return { ...old, settings: { ...old.settings, ...settings } };
      });

      setTimeout(() => {
        setModified({});
      }, 100);
    },
  };
}
