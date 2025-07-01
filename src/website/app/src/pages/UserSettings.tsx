import { useEffect, useRef, useState } from "react";
import Column from "../dawn-ui/components/Column";
import Container from "../dawn-ui/components/Container";
import Page from "../dawn-ui/components/Page";
import Words, { TextType } from "../dawn-ui/components/Words";
import AppNavbar from "../Navbar";
import Row from "../dawn-ui/components/Row";
import Button from "../dawn-ui/components/Button";
import { showErrorAlert } from "../dawn-ui/components/AlertManager";
import { axiosClient } from "..";

interface Trigger {
  what: string;
  tags: string[];
}

export default function UserSettings() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const triggerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const result = await axiosClient.get("/api/imposition");
      console.log(result.data);
      setTriggers(
        result.data.map((x: any) => {
          return { ...x, tags: x.tags.split(";") };
        }),
      );
    })();
  }, []);

  function addTrigger() {
    if (!triggerRef.current) return;
    const value = triggerRef.current.value;
    if (triggers.find((x) => x.what === value))
      return showErrorAlert("You have already added that trigger!");
    triggerRef.current.value = "";
    setTriggers((x) => [
      ...x,
      { what: value, tags: ["green", "yellow", "bombard", "by others"] },
    ]);
  }

  function updateTag(what: string, tag: string, value: boolean) {
    setTriggers((o) => {
      const old: Trigger[] = JSON.parse(JSON.stringify(o));
      const part = old.findIndex((x) => x.what === what);
      if (!value) {
        const index = old[part].tags.findIndex((x) => x === tag);
        if (index !== -1) old[part].tags.splice(index, 1);
      } else {
        old[part].tags.push(tag);
      }
      return [...old];
    });
  }

  async function saveTriggers() {
    await axiosClient.post("/api/imposition", triggers);
  }

  return (
    <>
      <AppNavbar full />
      <Page full>
        <Column>
          <Container title="Your Settings">
            <Words type={TextType.Heading}>Your Triggers</Words>
            <table>
              <tbody>
                <tr>
                  <th>Trigger</th>
                  <th style={{ textAlign: "left" }}>When can it be used?</th>
                  <th>Actions</th>
                </tr>
                {triggers.map((x) => (
                  <tr key={x.what}>
                    <td>{x.what}</td>
                    <td>
                      {[
                        "Anytime",
                        "Green",
                        "Yellow",
                        "Red",
                        "Bombard",
                        "By Others",
                      ].map((t) => (
                        <div key={t} style={{ display: "inline-block" }}>
                          <input
                            checked={x.tags.includes(t.toLowerCase())}
                            disabled={
                              x.tags.includes("anytime") && t !== "Anytime"
                            }
                            type="checkbox"
                            onChange={(e) =>
                              updateTag(
                                x.what,
                                t.toLowerCase(),
                                e.currentTarget.checked,
                              )
                            }
                          />
                          <label>{t}</label>
                        </div>
                      ))}
                    </td>
                    <td>
                      <Button
                        onClick={() => {
                          setTriggers((old) => {
                            let index = old.findIndex((y) => y.what === x.what);
                            old.splice(index, 1);
                            return [...old];
                          });
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Row util={["small-gap"]}>
              <input ref={triggerRef} style={{ width: "fit-content" }} />
              <Button onClick={addTrigger}>Add!</Button>
            </Row>
            <Button big onClick={saveTriggers}>
              Save Settings
            </Button>
          </Container>
        </Column>
      </Page>
    </>
  );
}
