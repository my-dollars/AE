importScripts('https://cdnjs.cloudflare.com');

onmessage = function(e) {
    const { height, lastHash, difficulty } = e.data;
    let nonce = 0;
    const target = "0".repeat(difficulty);

    while (true) {
        nonce++;
        const data = height + lastHash + nonce + difficulty;
        const hash = CryptoJS.SHA256(data).toString();

        if (hash.startsWith(target)) {
            postMessage({ status: 'found', hash: hash, nonce: nonce });
            break;
        }
        
        if (nonce % 5000 === 0) {
            postMessage({ status: 'progress', nonce: nonce });
        }
    }
};

