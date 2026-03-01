importScripts('https://cdnjs.cloudflare.com');

onmessage = function(e) {
    let { height, diff } = e.data;
    let nonce = 0;
    let target = "0".repeat(diff);
    
    while(true) {
        nonce++;
        // Генерируем хеш
        let hash = CryptoJS.SHA256(height + "node" + nonce).toString();
        
        if(hash.startsWith(target)) {
            postMessage({type: 'found', hash: hash});
            break;
        }
        
        // Отправляем прогресс раз в 10к итераций
        if(nonce % 10000 === 0) postMessage({type: 'log', n: nonce});
    }
}
