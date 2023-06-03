onmessage = function (e) {
    if (e.data == "onload") {
        fetch("https://api.aozora.my.id/kurukuru")
        .then(res => res.json())
        .then(res => {
            if (res.error) {
                postMessage("onloadError")
                return;
            }
            
            postMessage(res.counts);
        })
        .catch(err => postMessage("onloadError"));
    }
    
    else if (e.data.counts && e.data.isTrusted) {
        fetch("https://api.aozora.my.id/kurukuru/update", {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                counts: e.data.counts,
                isTrusted: e.data.isTrusted
            })
        })
        .then(res => res.json())
        .then(res => {
            if (res.error) {
                if (res.autoclick) {
                    postMessage("monika");
                    return;
                }
                postMessage("updateUnauthorized");
            }
        })
        .catch(err => postMessage("updateError"));
    }
}