const data = {};
let usernames = {};

document.addEventListener("DOMContentLoaded", async () => {
    if (!localStorage.getItem("usernames"))
        localStorage.setItem("usernames", "{}");
    usernames = JSON.parse(localStorage.getItem("usernames"));
    let cusernames = (await fetchData("usernames")).data;
    for (const i in cusernames) {
        if (!usernames[i] || usernames[i] !== cusernames[i])
            usernames[i] = cusernames[i];
    }
    localStorage.setItem("usernames", JSON.stringify(usernames));

    console.log(usernames);
    loadLeaderboardPage();
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

    if (page === "leaderboards")
        loadLeaderboardPage();
}

async function loadLeaderboardPage() {
    if (!data.economy) data.economy = await fetchData("economy");
    if (!data.userData) data.userData = await fetchData("user_data");

    document.getElementById("economy-leaderboard").innerHTML =
        createLeaderboard(data.economy.data.map(x => [x.balance, x.user_id]), "money");

    document.getElementById("messages-leaderboard").innerHTML =
        createLeaderboard(data.userData.data.map(x => [x.messages_sent, x.user_id]), "messages");

    document.getElementById("vctime-leaderboard").innerHTML =
        createLeaderboard(data.userData.data.map(x => [x.vc_time, x.user_id]), "minutes");

    document.getElementById("bump-leaderboard").innerHTML =
        createLeaderboard(data.userData.data.map(x => [x.bumps, x.user_id]), "bumps");
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
function createLeaderboard(data, unit = "times") {
    data = data.sort((a, b) => b[0] - a[0]).filter(x => x[0] > 0);

    let text = "";
    for (const i in data) {
        text += `
            <div style="display: flex; gap: 10px;">
                <label>${parseInt(i) + 1}.</label>
                <b>${getUsername(data[i][1])}</b>
                <label>(${data[i][0]} ${unit})<label>
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