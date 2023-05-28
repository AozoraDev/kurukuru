let img = document.createElement("img");
img.src = "img/herta-kurukuru.gif";
img.alt = "Herta Kurukuru";
img.width = 240;

const container = document.querySelector(".container");
const data = document.querySelector(".data");
let total = data.querySelector("h1");

let totalCounts;
let isTrusted;
let timeout;

function startTimeout() {
    timeout = setTimeout(function() {
        isTrusted = false;
    }, 10000);
}

window.onload = function() {
    const loading = document.querySelector(".loading");
    let message = loading.querySelector("span");
    let header = loading.querySelector("h2");
    
    fetch("https://api-aozora.alwaysdata.net/kurukuru")
    .then(res => res.json())
    .then(res => {
        if (res.error) {
            header.innerText = "Oops!";
            message.style.display = "block";
            
            return;
        }
        
        totalCounts = res.counts;
        total.innerText = totalCounts;
        setTimeout(function() {
            loading.classList.add("loaded");
        }, 1000);
    })
    .catch(err => {
        header.innerText = "Oops!";
        message.style.display = "block";
    })
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
    
    fetch("http://localhost:8080/kurukuru/update", {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            counts: counts,
            isTrusted: isTrusted
        })
    })
    .then(res => res.json())
    .then(res => {
        if (res.error) {
            console.error(`${counts} counts is not saved due unauthorized access to the database!`);
            return;
        }
    })
    .catch(err => console.error(`${counts} counts is not saved due to error on the database!`));
}, 5000);