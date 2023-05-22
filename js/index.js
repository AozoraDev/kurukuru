let sfx = new Audio("audio/kurukuru.m4a")
sfx.preload = "auto";

let img = document.createElement("img");
img.src = "img/herta-kurukuru.gif";
img.alt = "Herta Kurukuru";
img.width = 240;

window.onload = function() {
    const loading = document.querySelector(".loading");
    setTimeout(function() {
        loading.classList.add("loaded");
    }, 1000);
}

const container = document.querySelector(".container");
container.addEventListener("click", function() {
    let clonedSfx = sfx.cloneNode();
    let clonedImg = img.cloneNode();
    
    container.appendChild(clonedImg);
    clonedSfx.play();
    
    setTimeout(function() {
        container.removeChild(clonedImg);
    }, 800);
});