import express from 'express';
import { createClient } from '@tursodatabase/serverless';

const app = express();
app.use(express.json());

// 从环境变量读取 Turso 数据库连接信息
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('缺少 TURSO_DATABASE_URL 或 TURSO_AUTH_TOKEN 环境变量');
}

const db = createClient({ url, authToken });

// 初始化数据库表（如果不存在）
async function initDatabase() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS blessings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nickname TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('数据库初始化成功');
  } catch (err) {
    console.error('数据库初始化失败:', err);
  }
}
initDatabase();

// 获取祝福列表（按时间倒序，最新在前）
app.get('/api/blessings', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM blessings ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) {
    console.error('查询失败:', err);
    res.status(500).json({ error: '数据库查询失败' });
  }
});

// 提交新祝福
app.post('/api/blessings', async (req, res) => {
  const { nickname, content } = req.body;
  if (!nickname || !content || nickname.trim() === '' || content.trim() === '') {
    return res.status(400).json({ error: '昵称和祝福内容不能为空' });
  }
  try {
    await db.execute({
      sql: 'INSERT INTO blessings (nickname, content) VALUES (?, ?)',
      args: [nickname.trim(), content.trim()]
    });
    res.status(201).json({ message: '祝福已提交' });
  } catch (err) {
    console.error('插入失败:', err);
    res.status(500).json({ error: '保存祝福失败' });
  }
});

export default app;
