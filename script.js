const tg = window.Telegram.WebApp;
tg.expand();

let minerWorker = null;
let isMining = false;

let state = {
    login: localStorage.getItem('bc_login') || "",
    pass: localStorage.getItem('bc_pass') || "",
    bal: parseFloat(localStorage.getItem('bc_bal')) || 0,
    height: parseInt(localStorage.getItem('bc_height')) || 0,
    diff: 3
};

window.onload = () => {
    if (state.login) {
        document.getElementById('auth-title').innerText = "RESTORE SESSION";
        document.getElementById('node-login').value = state.login;
        document.getElementById('node-login').readOnly = true;
    }
};

function log(m) {
    const c = document.getElementById('console');
    c.innerHTML += `> ${m}<br>`;
    c.scrollTop = c.scrollHeight;
}

function handleAuth() {
    const l = document.getElementById('node-login').value;
    const p = document.getElementById('node-pass').value;

    if (l.length < 3 || p.length < 4) return alert("Логин > 3, Пароль > 4!");

    if (!state.login) {
        localStorage.setItem('bc_login', l);
        localStorage.setItem('bc_pass', p);
        state.login = l; state.pass = p;
    } else if (l !== state.login || p !== state.pass) {
        return alert("Ошибка: Неверный пароль!");
    }
    
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-screen').classList.remove('hidden');
    document.getElementById('user-display').innerText = state.login.toUpperCase();
    updateUI();
}

function updateUI() {
    document.getElementById('bal').innerText = state.bal.toFixed(4);
    document.getElementById('blocks').innerText = state.height;
}

function toggleMining() {
    const btn = document.getElementById('mineBtn');
    if (!isMining) {
        isMining = true;
        btn.innerText = "STOP ENGINE";
        btn.classList.add('mining-on');
        
        // ЗАПУСК ВОРКЕРА ИЗ ФАЙЛА
        minerWorker = new Worker('worker.js');
        minerWorker.postMessage({height: state.height, diff: state.diff});

        minerWorker.onmessage = (e) => {
            if(e.data.type === 'found') {
                state.bal += 10;
                state.height++;
                localStorage.setItem('bc_bal', state.bal);
                localStorage.setItem('bc_height', state.height);
                log(`<span style="color:#4ade80">FOUND! +10 COIN</span>`);
                updateUI();
                tg.HapticFeedback.notificationOccurred('success');
                minerWorker.postMessage({height: state.height, diff: state.diff});
            } else {
                if(e.data.n % 20000 === 0) log(`Nonce: ${e.data.n}...`);
            }
        };
    } else {
        isMining = false;
        btn.innerText = "START MINING";
        btn.classList.remove('mining-on');
        minerWorker.terminate();
        log("Stopped.");
    }
}

