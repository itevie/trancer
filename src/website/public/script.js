const data = {};
let usernames = {};

document.addEventListener("DOMContentLoaded", async () => {
    await setLoading(["economy-leaderboard", "messages-leaderboard", "vctime-leaderboard", "bump-leaderboard", "command-usage-leaderboard"]);

    if (!localStorage.getItem("usernames"))
        localStorage.setItem("usernames", "{}");
    usernames = JSON.parse(localStorage.getItem("usernames"));
    let cusernames = (await fetchData("usernames")).data;
    for (const i in cusernames) {
        if (!usernames[i] || usernames[i] !== cusernames[i])
            usernames[i] = cusernames[i];
    }
    localStorage.setItem("usernames", JSON.stringify(usernames));

    let p = window.location.hash.replace("#", "");

    p ? loadPage(p) : loadLeaderboardPage();
});

/**
 * 
 * @param {string} page 
 */
function loadPage(page) {
    /**
     * @type {HTMLElement[]}
     */
    let dataPages = document.querySelectorAll("[data-page-id]");
    for (const page of dataPages) {
        page.style.display = "none";
    }

    let wantedPage = document.querySelector(`[data-page-id=${page}]`);
    wantedPage.style.display = "block";

    window.history.pushState(null, "", "#" + page);

    if (page === "leaderboards")
        loadLeaderboardPage();
    else if (page === "server")
        loadServerPage();
    else if (page === "bot")
        loadBotPage();
}

let lbSearch = null;
async function loadLeaderboardPage() {
    if (!data.economy) data.economy = await fetchData("economy");
    if (!data.userData) data.userData = await fetchData("user_data");

    document.getElementById("economy-leaderboard").innerHTML =
        createLeaderboard(data.economy.data.map(x => [x.balance, x.user_id]), "money", lbSearch);

    document.getElementById("messages-leaderboard").innerHTML =
        createLeaderboard(data.userData.data.map(x => [x.messages_sent, x.user_id]), "messages", lbSearch);

    document.getElementById("vctime-leaderboard").innerHTML =
        createLeaderboard(data.userData.data.map(x => [x.vc_time, x.user_id]), "minutes", lbSearch);

    document.getElementById("bump-leaderboard").innerHTML =
        createLeaderboard(data.userData.data.map(x => [x.bumps, x.user_id]), "bumps", lbSearch);
}

const serverCharts = [];
async function loadServerPage() {
    if (!data.member_count) data.member_count = await fetchData("member_count");
    if (!data.messages) data.messages = await fetchData("messages");

    for (const chart of serverCharts) chart.destroy();

    const ctx_member = document.getElementById('member-count-overtime-chart');

    serverCharts.push(new Chart(ctx_member, {
        type: "line",
        data: {
            labels: data.member_count.data.map(x => x.time),
            datasets: [{
                label: "Member Count Overtime",
                data: data.member_count.data.map(x => x.amount),
            }]
        }
    }));

    const filters = {
        "minute": /[0-9]+\/[0-9]+\/[0-9]+ [0-9]+:[0-9]+/,
        "hour": /[0-9]+\/[0-9]+\/[0-9]+ [0-9]+/,
        "day": /[0-9]+\/[0-9]+\/[0-9]+/,
        "month": /[0-9]+\/[0-9]+/,
    }

    const ctx_messages = document.getElementById("messages-overtime-chart");
    const d = convertTimes(data.messages.data, filters[document.getElementById("messages-overtime-filter").value], "amount")
    serverCharts.push(new Chart(ctx_messages, {
        type: "line",
        data: {
            labels: d.map(x => x.time),
            datasets: [{
                label: "Messages Overtime",
                data: d.map(x => x.amount),
            }]
        }
    }));
}

function updateServerGraphs() {
    loadServerPage();
}

async function loadBotPage() {
    if (!data.commandUsage) data.commandUsage = await fetchData("command_usage");

    document.getElementById("command-usage-leaderboard").innerHTML =
        createLeaderboard(data.commandUsage.data.map(x => [x.used, x.command_name]), "times");
}

function convertTimes(data, regex, key) {
    let times = {};
    for (const d of data) {
        let time = d.time.match(regex);
        if (!times[time]) times[time] = 0;
        times[time] += d[key];
    }

    let final = [];
    for (const i in times) {
        final.push({
            time: i,
            [key]: times[i]
        });
    }

    return final;
}

/**
 * 
 * @param {string[]} ids 
 */
function setLoading(ids) {
    for (const id of ids) {
        document.getElementById(id).innerHTML =
            `<div class="loader">🌀</div>`;
    }
}

function updateLeaderboardPageSeach() {
    lbSearch = document.getElementById("leaderboard-search").value;
    loadLeaderboardPage();
}

function fetchData(type) {
    return new Promise((resolve, reject) => {
        fetch(`/data/${type}`)
            .then(async data => {
                return resolve(data.json());
            })
            .catch(err => {
                reject(err);
            });
    });
}

/**
 * 
 * @param {[number, string][]} data 
 */
function createLeaderboard(data, unit = "times", search = null) {
    data = data.sort((a, b) => b[0] - a[0]).filter(x => x[0] > 0);

    let text = "";
    for (const i in data) {
        const username = getUsername(data[i][1]);
        text += `
            <div style="display: flex; gap: 10px;">
                ${search && username.match(search) ? "<mark>" : ""}
                <label>${parseInt(i) + 1}.</label>
                <b>${username}</b>
                <label>(${data[i][0]} ${unit})<label>
                ${search && username.match(search) ? "</mark>" : ""}
            </div>
        `;
    }


    return text;
}

function getUsername(id) {
    if (usernames[id]) return usernames[id];
    else if (JSON.parse(localStorage.getItem("usernames"))[id])
        return JSON.parse(localStorage.getItem("usernames"))[id];
    else return id;
}