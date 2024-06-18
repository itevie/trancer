import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { client } from "..";
import { generateCode } from "../util/other";
import { getSpirals } from "../util/actions/spirals";


const app = express();
app.use(cors());
app.use(bodyParser.json());

const codes: { [key: string]: string } = {};

// Sends a code to a user
app.post("/api/code", async (req, res) => {
    const userid = req.body.username;
    if (!userid) return res.status(404).send({ message: "Invalid user provided " });

    try {
        // Fetch user and validate
        const user = await client.users.fetch(userid);
        if (!user) return res.status(404).send({ message: "Cannot find a user with that ID" });

        const code = generateCode(10);
        codes[code] = user.id;

        // Try to send DM
        await user.send(`Your code to login is: **${code}**`);
        return res.status(200).send({ message: "Code sent." });
    } catch {
        return res.status(500).send({
            message: "An error occured"
        });
    }
});

// Returns list of spirals
app.get("/api/spirals", async (req, res) => {
    const spirals = await getSpirals();
    return res.status(200).send({
        spirals,
    })
});

app.listen(3000, () => {
    console.log("Backend server listening on port 3000");
});