let ws;
let pingWorker;
let ping = Date.now();

const http = "https://";
const origin = "api.aozora.my.id";

onmessage = function (e) {
    if (e.data.code == 100) {
        if (e.data.usewebsocket) {
            ws = new WebSocket("wss://" + origin + "/kurukuru/ws");
            
            ws.onerror = function(e) {
                postMessage({ code: -100 });
                clearInterval(pingWorker);
            }
            
            ws.onopen = function(e) {
                postMessage({ code: 99 });
                pingWorker = setInterval(function() {
                    ping = Date.now();
                    ws.send("ping");
                }, 1000);
            }
            
            ws.onclose = function(e) {
                postMessage({ code: -100 });
                clearInterval(pingWorker);
            }
            
            ws.onmessage = function(e) {
                const response = (e.data == "pong") ? "pong" : JSON.parse(e.data);
                
                //if (response != "pong") postMessage({ code: 69420, data: response }); // Debug only
                
                // Ping latency
                if (response == "pong") {
                    postMessage({ code: 1000, ping: Date.now() - ping }); // Debug only
                }
                
                else if (!response.error) {
                    switch (response.code) {
                        // Connection established
                        case 0:
                            postMessage({ code: 100, totalPlayers: response.totalPlayers, totalCounts: response.totalCounts, token: response.token });
                        break;
                        
                        // Current counts is saved
                        case 1:
                            postMessage({ code: 101, totalPlayers: response.totalPlayers, totalCounts: response.totalCounts });
                        break;
                    }
                }
                
                else if (response.error) {
                    switch (response.code) {
                        // Unauthorized
                        case 2:
                            postMessage({ code: 95 });
                        break;
                        
                        // API breaks
                        case 3:
                            postMessage({ code: 94 });
                        break;
                        
                        // Autoclick detected
                        case 4:
                            postMessage({ code: 93 });
                        break;
                    }
                }
            }
        } else {
            fetch(http + origin + "/kurukuru")
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    postMessage({ code: -100 })
                    return;
                }
                
                postMessage({ code: 100, totalCounts: res.counts });
            })
            .catch(err => postMessage({ code: -100 }));
        }
    }
    
    else if (e.data.code == 98) {
        if (e.data.usewebsocket) {
            ws.send(JSON.stringify({ counts: e.data.counts, isTrusted: e.data.isTrusted }));
        } else {
            fetch(http + origin + "/kurukuru/update", {
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
                        postMessage({ code: 93 });
                        return;
                    }
                    postMessage({ code: 95 });
                }
            })
            .catch(err => postMessage({ code: 94 }));
        }
    }
}