let img = document.createElement("img");
img.src = "img/herta-kurukuru.gif";
img.alt = "Herta Kurukuru";
img.width = 240;

const formatter = new Intl.NumberFormat();
const worker = new Worker("js/worker.js");

const container = document.querySelector(".container");
const data = document.querySelector(".data");
const loading = document.querySelector(".loading");

let totalCounts;
let isTrusted;
let timeout;

// Apply settings
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

let message = loading.querySelector("span");
let header = loading.querySelector("h2");
let total = data.querySelector("h1");
worker.onmessage = function (e) {
    // Error if API is dead
    if (e.data == "onloadError") {
        header.innerText = "Oops!";
        message.style.display = "block";
    }
    
    // Add total counts and hide the loading
    else if (typeof e.data == "number") {
        totalCounts = e.data;
        total.innerText = formatter.format(totalCounts);
        
        setTimeout(function() {
            loading.classList.add("loaded");
        }, 1000);
    }
    
    // Error during post user counts to database
    else if (e.data == "updateError") {
        console.error("Your current counts is not saved to the database due to error connecting to API");
    }
    
    // Error when unauthorized
    else if (e.data == "updateUnauthorized") {
        console.error("Your current counts is not saved to the database due to unauthorized request to API");
    }
    
    // ...
    else if (e.data == "monika") {
        executeMonika();
    }
}

window.onload = function() {
    if (localStorage.getItem("blocked") == "true") {
        header.innerText = "Oops!";
        message.innerText = "You are blocked from using this service.";
        message.style.display = "block";
        
        return;
    }
    
    worker.postMessage("onload");
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
    settings[index][ele.name] = ele.checked;
    
    localStorage.setItem("settings", JSON.stringify(settings));
}

let sfxPos = 0;
let tempCounts = 0;
let userCounts = 0
let user = data.querySelector("span");
const s0Final = settings[0].kurukuru || settings[0].kururin;
container.addEventListener("click", function(e) {
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
});

setInterval(function() {
    if (!isTrusted) return;
    
    const counts = tempCounts;
    tempCounts = 0;
    
    worker.postMessage({ counts: counts, isTrusted: isTrusted });
}, 5000);