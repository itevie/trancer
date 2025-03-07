import { useEffect, useState } from "react";
import Container from "../dawn-ui/components/Container";
import Page from "../dawn-ui/components/Page";
import AppNavbar from "../Navbar";
import { axiosClient } from "..";
import Column from "../dawn-ui/components/Column";
import Row from "../dawn-ui/components/Row";
import Words from "../dawn-ui/components/Words";
import useUsernames from "../hooks/useUsernames";
import MultiSelect from "../dawn-ui/components/MultiSelect";

export default function LeaderboardPage() {
  const [search, setSearch] = useState<string>("");
  const [userData, setUserData] = useState<UserData[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "messages_sent",
    "xp",
    "vc_time",
    "bumps",
  ]);

  const { getUsername } = useUsernames();

  useEffect(() => {
    const id = window.location.href.match(/servers\/([0-9]+)/)?.[1];
    axiosClient.get<UserData[]>(`/api/servers/${id}/user_data`).then((x) => {
      console.log(x.data[0]);
      setUserData(x.data);
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
          <MultiSelect
            elements={[
              "messages_sent",
              "vc_time",
              "bumps",
              "xp",
              "c4_win",
              "c4_lose",
              "c4_tie",
              "ttt_win",
              "ttt_lose",
              "ttt_tie",
              "count_ruined",
            ]}
            onChange={(v) => setSelectedTypes(v)}
            selected={selectedTypes}
            updateSelectedKey={1}
          />
          <Row util={["flex-wrap"]}>
            {/* Peak prgoramming right here: */}
            {(
              [
                ["messages_sent", "Messages", " 💬"],
                ["vc_time", "VC Time", "m"],
                ["bumps", "Bumps", " Bumps"],
                ["xp", "XP", " XP"],
                ["c4_win", "Connect 4 Wins", " wins"],
                ["c4_lose", "Connect 4 Loses", " loses"],
                ["c4_tie", "Connect 4 Ties", " ties"],
                ["ttt_win", "TicTacToe Wins", " wins"],
                ["ttt_lose", "TicTacToe Loses", " loses"],
                ["ttt_tie", "TicTacToe Ties", " ties"],
                ["count_ruined", "Count Ruined", " times"],
              ] as [keyof UserData, string, string][]
            )
              .filter((x) => selectedTypes.includes(x[0]))
              .map((part) => (
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
