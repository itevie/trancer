import { useEffect, useState } from "react";
import { axiosClient } from ".";

export default function useUsernames() {
  const [usernames, setUsernames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    axiosClient
      .get<{ [key: string]: string }>("/api/data/usernames")
      .then((x) => setUsernames(x.data));
  }, []);

  return {
    usernames,
    getUsername: (id: string): string => {
      if (!usernames[id]) return `! ${id}`;
      return usernames[id];
    },
  };
}
