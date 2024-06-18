import { Alert, Box, Button, Card, CardContent, Dialog, Input, Modal, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import config from "../config.json";

export let showLoginPrompt = () => { };

export default function LoginPrompt() {
    const [shown, setShown] = useState<boolean>(false);
    const [disable, setDisable] = useState<boolean>(false);
    const [getCode, setGetCode] = useState<boolean>(false);
    const usernameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        showLoginPrompt = () => {
            setShown(true);
        }
    }, []);

    async function sendCode() {
        setDisable(true);
        const username = usernameRef.current?.value as string;
        try {
            const result = await axios.post(`${config.apiBase}/api/code`, { username });
            setGetCode(true);
        } catch (err) {
            console.log(err);
        } finally {
            setDisable(false);
        }
    }

    function cancel() {
        setShown(false);
        setGetCode(false);
    }

    return (
        <Dialog open={shown}>
            <Box>
                <Card>
                    {
                        !getCode
                            ? <CardContent>
                                <Typography variant="h4">
                                    Login via Hypno Helper
                                </Typography>
                                <Typography>
                                    Enter your Discord ID (if you don't know it, run the <code>id</code> command), and Hypno Helper will send you a code.
                                    Once you have recieved the code, enter it here.
                                </Typography>
                                <Input disabled={disable} name="id" inputRef={usernameRef} placeholder="Discord ID"></Input>
                                <Button disabled={disable} onClick={sendCode}>Send Code</Button>
                                <Button onClick={cancel}>Cancel</Button>
                            </CardContent>
                            : <CardContent>
                                <Typography variant="h4">
                                    Login via Hypno Helper
                                </Typography>
                                <Typography>
                                    Enter in the code you have recieved from Hypno Helper:
                                </Typography>
                                <Input disabled={disable} name="code" placeholder="Code"></Input>
                                <Button>Submit</Button>
                                <Button onClick={cancel}>Cancel</Button>
                            </CardContent>
                    }
                </Card>
            </Box>
        </Dialog>
    )
}