const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

let users = []; // 메모리 저장

app.use(cors());
app.use(bodyParser.json());

app.use(cors({
  origin: "https://hshschatbot0.github.io", // 프론트엔드 도메인
  credentials: true
}));

app.post('/register', (req, res) => {
  const { id, password, name, role } = req.body;
  const exists = users.find(u => u.id === id);
  if (exists) {
    return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });
  }
  users.push({ id, password, name, role });
  res.status(201).json({ message: '회원가입 성공' });
});

app.post('/login', (req, res) => {
  const { id, password } = req.body;
  const user = users.find(u => u.id === id && u.password === password);
  if (!user) {
    return res.status(401).json({ message: '아이디 또는 비밀번호 오류' });
  }
  res.json({ message: '로그인 성공', user });
});

app.get('/users', (req, res) => {
  res.json(users);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use(cors({
  origin: 'https://your-frontend-domain.com', // 프론트엔드 도메인으로 변경
  credentials: true
}));
