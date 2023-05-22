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
let sfxPos = 0;
container.addEventListener("click", function() {
    let clonedSfx = sfx[sfxPos].cloneNode();
    let clonedImg = img.cloneNode();
    
    container.appendChild(clonedImg);
    clonedSfx.play();
    sfxPos = (sfxPos == 0) ? 1 : 0;
    
    setTimeout(function() {
        container.removeChild(clonedImg);
    }, 800);
});