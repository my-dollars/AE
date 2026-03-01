const tg = window.Telegram.WebApp;
tg.expand();

let isMining = false;
let minerWorker = null;

let state = {
    login: localStorage.getItem('bc_login') || "",
    pass: localStorage.getItem('bc_pass') || "",
    bal: parseFloat(localStorage.getItem('bc_bal')) || 0,
    height: parseInt(localStorage.getItem('bc_height')) || 0
};

// Функция входа
function handleAuth() {
    const l = document.getElementById('node-login').value;
    const p = document.getElementById('node-pass').value;

    if (l.length < 2 || p.length < 2) {
        tg.showAlert("Введите логин и пароль!");
        return;
    }

    // Если аккаунта нет — создаем, если есть — проверяем
    if (!state.login) {
        localStorage.setItem('bc_login', l);
        localStorage.setItem('bc_pass', p);
        state.login = l; state.pass = p;
    } else if (l !== state.login || p !== state.pass) {
        tg.showAlert("Неверный логин или пароль!");
        return;
    }

    // Переход в профиль
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('page-wallet').classList.add('active');
    document.getElementById('main-nav').style.display = 'flex';
    document.getElementById('addr-display').innerText = "ID: " + btoa(state.login).substring(0, 10);
    updateUI();
}

// Переключение табов внизу
function showTab(tabId, el) {
    // Скрываем все страницы
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Показываем нужную
    document.getElementById('page-' + tabId).classList.add('active');
    
    // Снимаем активность со всех кнопок навигации
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active-nav'));
    // Делаем активной текущую
    el.classList.add('active-nav');
    
    tg.HapticFeedback.impactOccurred('light');
}

function updateUI() {
    document.getElementById('bal').innerText = state.bal.toFixed(2) + " NODE";
    document.getElementById('mine-blocks').innerText = "Блоки: " + state.height;
}

// Простая симуляция майнинга (если worker.js еще не настроен)
function toggleMining() {
    const btn = document.getElementById('mineBtn');
    isMining = !isMining;

    if (isMining) {
        btn.innerText = "ОСТАНОВИТЬ";
        btn.style.background = "#ff3b30";
        tg.HapticFeedback.notificationOccurred('success');
        
        // Каждые 5 секунд добавляем монету для теста
        window.mineInterval = setInterval(() => {
            state.bal += 1;
            state.height += 1;
            localStorage.setItem('bc_bal', state.bal);
            localStorage.setItem('bc_height', state.height);
            updateUI();
        }, 5000);
    } else {
        btn.innerText = "ЗАПУСТИТЬ";
        btn.style.background = "#007aff";
        clearInterval(window.mineInterval);
    }
}
