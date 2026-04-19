// 使用 Node.js 原生 SQLite 模块
const { DatabaseSync } = require('node:sqlite');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 确保数据库文件存在
const DB_PATH = path.join(__dirname, 'anniversary.db');
// 同步连接数据库
const db = new DatabaseSync(DB_PATH);

// 初始化数据库和祝福表
function initDatabase() {
    // 创建祝福表（如果不存在）
    db.exec(`
        CREATE TABLE IF NOT EXISTS blessings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nickname TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('数据库初始化成功！');
}
initDatabase();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// 获取祝福列表（按时间倒序，最新在前）
app.get('/api/blessings', (req, res) => {
    try {
        // 使用 prepare 方法创建预编译语句，防止 SQL 注入
        const stmt = db.prepare('SELECT * FROM blessings ORDER BY created_at DESC LIMIT 50');
        const blessings = stmt.all();
        res.json(blessings);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: '数据库查询失败' });
    }
});

// 提交新祝福
app.post('/api/blessings', (req, res) => {
    const { nickname, content } = req.body;
    if (!nickname || !content || nickname.trim() === '' || content.trim() === '') {
        return res.status(400).json({ error: '昵称和祝福内容不能为空' });
    }
    try {
        // 使用 prepare 方法插入新祝福，防止 SQL 注入
        const stmt = db.prepare('INSERT INTO blessings (nickname, content) VALUES (?, ?)');
        const info = stmt.run(nickname.trim(), content.trim());
        res.status(201).json({ id: info.lastInsertRowid, message: '祝福已提交' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: '保存祝福失败' });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`校庆小程序后端服务已启动: http://localhost:${PORT}`);
    console.log(`访问地址: http://localhost:${PORT}`);
});