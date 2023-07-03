const img = document.createElement("img");
img.src = "img/herta-kurukuru.gif";
img.alt = "Herta Kurukuru";
img.width = 240;

const formatter = new Intl.NumberFormat();
const worker = new Worker("js/worker.js");

const container = document.querySelector(".container");
const loading = document.querySelector(".loading");
const websocket = document.querySelector(".websocket");
const message = loading.querySelector("span");

let totalCounts;
let isTrusted;
let timeout;

// Apply settings
message.innerText = "Applying settings...";
settings.forEach(function (setting, index) {
    for (const key in setting) {
        const id = `#settings${index}[name="${key}"]`;
        let ele = document.querySelector(id);
        
        ele.checked = setting[key];
    }
});

worker.onerror = function (e) {
    console.error(e.message);
    return;
}

const header = loading.querySelector("h2");
const total = document.querySelector(".data h1");
const ping = websocket.querySelector("#ping small");
const pingIcon = document.querySelector("#ping i");
const totalPlayers = document.querySelector("#online small");

const usewebsocket = settings[1].usewebsocket;
worker.onmessage = function (e) {
    switch (e.data.code) {
        // -100: Error when no bitches, i mean... when failed to connecting to WebSocket or API
        // Error if API is dead or something
        case -100:
            header.innerText = "Oops!";
            message.innerHTML = "It seems that an error occurred while " + ((usewebsocket) ? "connecting to the server" : "retrieving data from the database") + ".<br />Please try again later.";
            loading.classList.remove("loaded");
            container.removeEventListener("click", onclick);
            
            if (usewebsocket) {
                pingIcon.className = "bx bx-wifi-off";
                pingIcon.style.color = "#FFF";
                ping.innerText = "0ms";
                totalPlayers.innerText = "0";
            }
        break;
        
        // 100: Connection estabilashed and initiation successfully
        // Add total counts and hide the loading element.
        // If websocket, add token to session storage and some stuff.
        case 100:
            totalCounts = e.data.totalCounts;
            if (e.data.totalPlayers) totalPlayers.innerText = e.data.totalPlayers;
            if (sessionStorage.getItem("token")) sessionStorage.removeItem("token");
            if (e.data.token) sessionStorage.setItem("token", e.data.token);
            total.innerText = formatter.format(totalCounts);
            message.innerText = "Starting...";
            
            setTimeout(function() {
                loading.classList.add("loaded");
            }, 1000);
        break;
        
        // 101 (WebSocket Only): Current counts is saved
        // Change the total counts and online players
        case 101:
            total.innerText = formatter.format(e.data.totalCounts);
            totalPlayers.innerText = e.data.totalPlayers;
        break;
        
        // 99 (WebSocket Only): Connected to the WebSocket but not initiated yet
        // In websocket, send message if connection estabilashed
        case 99:
            message.innerText = "Connected! Waiting for server response...";
        break;
        
        // 95: Your currents counts cannot be saved because... unauthorized
        case 95:
            const msg95 = "Your current counts is not saved to the database due to unauthorized request to API";
            notif(msg95);
        break;
        
        // 94: Like code 95, but this time because the API is dead or something
        case 94:
            const msg94 = "Your current counts is not saved to the database due to error connecting to API";
            notif(msg94);
        break;
        
        // 93: Autoclick detected
        case 93:
            const msg93 = "Autoclick detected! Your current counts is not saved.";
            notif(msg93);
        break;
        
        // 1000 (WebSocket Only): Pong received
        // In websocket, change ping every a sec
        case 1000:
            const latency = (e.data.ping > 999) ? 999 : e.data.ping;
            let color = "#FFF"
            let icon = "bx bx-wifi-off";
            
            if (latency > 700) {
                icon = "bx bx-wifi-1";
                color = "#FF0000";
            } else if (latency > 300) {
                icon = "bx bx-wifi-2";
                color = "#FFFF00";
            } else {
                icon = "bx bx-wifi";
                color = "#00FF00";
            }
            
            pingIcon.className = icon;
            pingIcon.style.color = color;
            ping.innerText = latency + "ms";
        break;
        
        // DEBUG STUFF
        // Nice number, btw
        case 69420:
            console.log(e.data.data);
        break;
    }
}

window.onload = function() {
    if (localStorage.getItem("blocked") == "true") {
        header.innerText = "Oops!";
        message.innerText = "You are blocked from using this service.";
        
        return;
    }
    
    if (!usewebsocket) websocket.style.display = "none";
    message.innerText = (usewebsocket) ? "Connecting..." : "Retrieving data...";
    worker.postMessage({ code: 100, usewebsocket: usewebsocket });
}

function startTimeout() {
    timeout = setTimeout(function() {
        isTrusted = false;
    }, 10000);
}

function openPopup(id) {
    const element = document.querySelector("#" + id);
    element.classList.add("open");
}

function closePopup(id) {
    const element = document.querySelector("#" + id);
    element.classList.remove("open");
}

function updateSettings(ele) {
    const index = Number(ele.id.slice(8));
    if (!settings[index]) settings[index] = {};
    settings[index][ele.name] = ele.checked;
    
    localStorage.setItem("settings", JSON.stringify(settings));
}

const notification = document.querySelector(".notification");
container.removeChild(notification); // No more dummy element
function notif(message) {
    let clonedNotif = notification.cloneNode(true);
    container.appendChild(clonedNotif);
    
    let notifMsg = clonedNotif.querySelector("span");
    notifMsg.innerText = message;
    setTimeout(function() {
        clonedNotif.classList.add("show");
    }, 100);
    setTimeout(function() {
        clonedNotif.classList.remove("show");
        setTimeout(function() {
            container.removeChild(clonedNotif);
        }, 500)
    }, 4100);
}

let sfxPos = 0;
let tempCounts = 0;
let userCounts = 0
const user = document.querySelector(".data span");
const s0Final = settings[0].kurukuru || settings[0].kururin;
function onclick(e) {
    if (timeout) clearTimeout(timeout);
    startTimeout();
    
    isTrusted = e.isTrusted;
    let clonedSfx = (s0Final) ? sfx[sfxPos].cloneNode() : null;
    let clonedImg = img.cloneNode();

    container.appendChild(clonedImg);
    if (s0Final) clonedSfx.play();
    tempCounts++;
    user.innerText = formatter.format(userCounts++);
    total.innerText = formatter.format(totalCounts++);
    if (sfx.length >= 2) sfxPos = (settings[0].randomize) ? Math.floor(Math.random() * sfx.length) : (sfxPos == 0) ? 1 : 0;
    
    if (s0Final) clonedSfx.addEventListener('ended', function() {
        // Release the audio resources
        clonedSfx.pause();
    });
    setTimeout(function() {
        container.removeChild(clonedImg);
    }, 800);
}

container.addEventListener("click", onclick);
setInterval(function() {
    if (!isTrusted) return;
    
    const counts = tempCounts;
    tempCounts = 0;
    
    worker.postMessage({ code: 98, usewebsocket: usewebsocket, counts: counts, isTrusted: isTrusted });
}, 5000);