import config from "./config.json";

export function getBaseUrl() {
    return config.apiBase;
}