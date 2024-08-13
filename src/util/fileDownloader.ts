import axios from "axios";
import { createWriteStream } from "fs";

export function downloadFile(link: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const writer = createWriteStream(path);

        axios.get(link, {
            responseType: "stream"
        }).then(response => {
            response.data.pipe(writer);

            writer.on("error", err => {
                reject(err);
            });

            writer.on("finish", () => {
                resolve();
            });
        });
    });
}