// 倒计时目标：2026年10月1日
const TARGET_DATE = new Date(2026, 9, 1);

function updateCountdown() {
    const now = new Date();
    const diff = TARGET_DATE - now;
    if (diff <= 0) {
        document.getElementById('days').innerText = '00';
        document.getElementById('hours').innerText = '00';
        document.getElementById('minutes').innerText = '00';
        document.getElementById('seconds').innerText = '00';
        return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    document.getElementById('days').innerText = String(days).padStart(2, '0');
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// 校歌播放器
const audio = document.getElementById('schoolAnthem');
const playBtn = document.getElementById('playPauseBtn');
const progressBar = document.getElementById('progressBar');

playBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playBtn.textContent = '⏸ 暂停';
    } else {
        audio.pause();
        playBtn.textContent = '▶ 播放';
    }
});

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        progressBar.value = (audio.currentTime / audio.duration) * 100;
    }
});

progressBar.addEventListener('input', (e) => {
    if (audio.duration) {
        audio.currentTime = (e.target.value / 100) * audio.duration;
    }
});

// 祝福墙
async function loadBlessings() {
    const res = await fetch('/api/blessings');
    const blessings = await res.json();
    const container = document.getElementById('blessingsList');
    if (blessings.length === 0) {
        container.innerHTML = '<div>暂无祝福，来抢沙发吧~</div>';
        return;
    }
    container.innerHTML = blessings.map(b => `
        <div class="blessing-item">
            <div class="blessing-nick">✨ ${escapeHtml(b.nickname)}</div>
            <div>${escapeHtml(b.content)}</div>
            <small style="color:#a5683a;">${new Date(b.created_at).toLocaleString()}</small>
        </div>
    `).join('');
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

document.getElementById('blessingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nickname = document.getElementById('nickname').value;
    const content = document.getElementById('content').value;
    const res = await fetch('/api/blessings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, content })
    });
    if (res.ok) {
        document.getElementById('nickname').value = '';
        document.getElementById('content').value = '';
        loadBlessings();
        alert('祝福已送出！');
    } else {
        alert('提交失败');
    }
});

// 活动导航
const activities = [
    { name: "校庆庆典大会", address: "北京市海淀区学院路30号大礼堂" },
    { name: "校友发展论坛", address: "北京市海淀区学院路30号国际交流中心" },
    { name: "校史馆开放日", address: "北京市海淀区学院路30号校史馆" }
];

const grid = document.getElementById('activitiesGrid');
activities.forEach(act => {
    const div = document.createElement('div');
    div.className = 'activity-item';
    div.innerHTML = `
        <div><strong>${act.name}</strong><br><small>${act.address}</small></div>
        <button class="nav-btn" data-address="${act.address}">🧭 导航</button>
    `;
    grid.appendChild(div);
});

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const addr = encodeURIComponent(btn.getAttribute('data-address'));
        window.open(`https://uri.amap.com/search?keyword=${addr}`, '_blank');
    });
});

loadBlessings();