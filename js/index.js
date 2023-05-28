let img = document.createElement("img");
img.src = "img/herta-kurukuru.gif";
img.alt = "Herta Kurukuru";
img.width = 240;

const worker = new Worker("js/worker.js");
const container = document.querySelector(".container");
const data = document.querySelector(".data");
const loading = document.querySelector(".loading");
let message = loading.querySelector("span");
let header = loading.querySelector("h2");
let total = data.querySelector("h1");

let totalCounts;
let isTrusted;
let timeout;

function startTimeout() {
    timeout = setTimeout(function() {
        isTrusted = false;
    }, 10000);
}

worker.onerror = function (e) {
    console.error(e.message);
    
    return;
}

worker.onmessage = function (e) {
    // Error if API is dead
    if (e.data == "onloadError") {
        header.innerText = "Oops!";
        message.style.display = "block";
    }
    
    // Add total counts and hide the loading
    else if (typeof e.data == "number") {
        totalCounts = e.data;
        total.innerText = totalCounts;
        
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
}

window.onload = function() {
    worker.postMessage("onload");
}

let sfxPos = 0;
let tempCounts = 0;
let userCounts = 0
let user = data.querySelector("span");
container.addEventListener("click", function(e) {
    if (timeout) clearTimeout(timeout);
    startTimeout();
    
    isTrusted = e.isTrusted;
    let clonedSfx = sfx[sfxPos].cloneNode();
    let clonedImg = img.cloneNode();

    container.appendChild(clonedImg);
    clonedSfx.play();
    tempCounts++;
    user.innerText = userCounts++;
    total.innerText = totalCounts++;
    sfxPos = (sfxPos == 0) ? 1: 0;
    
    clonedSfx.addEventListener('ended', function() {
        // Release the audio resources
        clonedSfx.pause();
        clonedSfx.currentTime = 0;
        clonedSfx.src = '';
        clonedSfx.load();
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