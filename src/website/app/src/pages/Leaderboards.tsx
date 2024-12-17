import { useEffect, useState } from "react";
import Container from "../dawn-ui/components/Container";
import Page from "../dawn-ui/components/Page";
import AppNavbar from "../Navbar";
import { axiosClient } from "..";
import Column from "../dawn-ui/components/Column";
import Row from "../dawn-ui/components/Row";
import Words from "../dawn-ui/components/Words";
import useUsernames from "../useUsernames";

export default function LeaderboardPage() {
  const [search, setSearch] = useState<string>("");
  const [userData, setUserData] = useState<UserData[]>([]);
  const [economy, setEconomy] = useState<Economy[]>([]);

  const { getUsername } = useUsernames();

  useEffect(() => {
    axiosClient.get<UserData[]>("/api/data/user_data").then((x) => {
      setUserData(x.data);
    });

    axiosClient.get<Economy[]>("/api/data/economy").then((x) => {
      setEconomy(x.data);
    });
  }, []);

  return (
    <>
      <AppNavbar full />
      <Page full>
        <Column>
          <Row
            util={["justify-center", "align-center"]}
            style={{ width: "300px" }}
          >
            <Words>Search: </Words>
            <input
              onChange={(e) => setSearch(e.target.value.toLowerCase())}
            ></input>
          </Row>
          <Row util={["flex-wrap"]}>
            {/* Balance Leaderboard */}
            <Container
              style={{ width: "fit-content" }}
              title="Economy Leaderboard"
            >
              {!economy ? (
                <Words>Loading...</Words>
              ) : (
                <table>
                  <tbody>
                    {economy
                      .sort((a, b) => b.balance - a.balance)
                      .slice(0, 50)
                      .map((x, i) => (
                        <tr
                          key={x.user_id}
                          className={`${
                            search &&
                            getUsername(x.user_id)
                              .toLowerCase()
                              .includes(search) &&
                            "dawn-highlight"
                          }`}
                        >
                          <td>{i + 1}</td>
                          <td>{getUsername(x.user_id)}</td>
                          <td style={{ textAlign: "end" }}>{x.balance} 🌀</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </Container>
            {/* Peak prgoramming right here: */}
            {(
              [
                ["messages_sent", "Messages", " 💬"],
                ["vc_time", "VC Time", "m"],
                ["bumps", "Bumps", " Bumps"],
                ["xp", "XP", " XP"],
              ] as [keyof UserData, string, string][]
            ).map((part) => (
              <Container
                style={{ width: "fit-content", height: "fit-content" }}
                title={`${part[1]} Leaderboard`}
              >
                {!userData ? (
                  <Words>Loading...</Words>
                ) : (
                  <table>
                    <tbody>
                      {userData
                        .filter((x) => x[part[0]] !== 0)
                        .sort(
                          (a, b) =>
                            (b[part[0]] as number) - (a[part[0]] as number)
                        )
                        .slice(0, 50)
                        .map((x, i) => (
                          <tr
                            key={x.user_id}
                            className={`${
                              search &&
                              getUsername(x.user_id)
                                .toLowerCase()
                                .includes(search) &&
                              "dawn-highlight"
                            }`}
                          >
                            <td>{i + 1}</td>
                            <td>{getUsername(x.user_id)}</td>
                            <td style={{ textAlign: "end" }}>
                              {x[part[0]]}
                              {part[2]}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </Container>
            ))}
          </Row>
        </Column>
      </Page>
    </>
  );
}
