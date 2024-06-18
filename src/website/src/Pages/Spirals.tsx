import { Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { getBaseUrl } from "../util";
import Visualiser from "./Components/Visualiser";
import "../style/spirals.css";

interface Spiral {
    link: string,
    created_by: string,
    created_at: string,
}

export default function Spirals() {
    const [spirals, setSpirals] = useState<Spiral[]>([]);

    useEffect(() => {
        (async () => {
            const s = (await axios.get(`${getBaseUrl()}/api/spirals`)).data.spirals;
            setSpirals(s);
        })();
    }, []);

    return (
        <>
            <Typography variant="h5">
                Spirals
            </Typography>
            <p>There are {spirals.length} spirals loaded!</p>
            <Visualiser />
        </>
    )
}