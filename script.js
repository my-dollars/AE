const tg = window.Telegram.WebApp;
tg.expand();

let minerWorker = null;
let isMining = false;

let state = {
    login: localStorage.getItem('bc_login') || "",
    pass: localStorage.getItem('bc_pass') || "",
    bal: parseFloat(localStorage.getItem('bc_bal')) || 0,
    height: parseInt(localStorage.getItem('bc_height')) || 0,
    addr: "",
    diff: 4
};

// Генерация адреса кошелька из логина
function genAddr(login) {
    return "TGA" + btoa(login).substring(0, 12).toUpperCase();
}

function handleAuth() {
    const l = document.getElementById('node-login').value;
    const p = document.getElementById('node-pass').value;

    if (!state.login) {
        localStorage.setItem('bc_login', l);
        localStorage.setItem('bc_pass', p);
        state.login = l; state.pass = p;
    } else if (l !== state.login || p !== state.pass) {
        return tg.showAlert("Неверные данные!");
    }
    
    state.addr = genAddr(state.login);
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('page-wallet').classList.add('active');
    document.getElementById('main-nav').style.display = 'flex';
    document.getElementById('addr-display').innerText = state.addr;
    updateUI();
}

function showTab(tab, el) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + tab).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active-nav'));
    el.classList.add('active-nav');
}

function updateUI() {
    document.getElementById('bal').innerText = state.bal.toFixed(2) + " NODE";
    document.getElementById('mine-blocks').innerText = "Блоки: " + state.height;
}

function toggleMining() {
    const btn = document.getElementById('mineBtn');
    if (!isMining) {
        isMining = true;
        btn.innerText = "ОСТАНОВИТЬ";
        btn.style.background = "#ff3b30";
        minerWorker = new Worker('worker.js');
        minerWorker.postMessage({height: state.height, diff: state.diff});

        minerWorker.onmessage = (e) => {
            if(e.data.type === 'found') {
                state.bal += 50.0;
                state.height++;
                localStorage.setItem('bc_bal', state.bal);
                localStorage.setItem('bc_height', state.height);
                updateUI();
                tg.HapticFeedback.notificationOccurred('success');
                minerWorker.postMessage({height: state.height, diff: state.diff});
            }
        };
    } else {
        isMining = false;
        btn.innerText = "ЗАПУСТИТЬ";
        btn.style.background = "#007aff";
        minerWorker.terminate();
    }
}

function copyAddr() {
    navigator.clipboard.writeText(state.addr);
    tg.showAlert("Адрес скопирован!");
}
