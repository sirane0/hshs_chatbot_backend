const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

let users = [];

const allowedOrigins = ["https://sirane0.github.io", "http://localhost:3000"];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(bodyParser.json());

app.post('/register', (req, res) => {
  const { id, password, name, role } = req.body;
  if (!id || !password || !name || !role) {
    return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
  }
  const exists = users.find(u => u.id === id);
  if (exists) {
    return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });
  }
  users.push({ id, password, name, role });
  res.status(201).json({ message: '회원가입 성공' });
});

app.post('/login', (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) {
    return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
  }
  const user = users.find(u => u.id === id && u.password === password);
  if (!user) {
    return res.status(401).json({ message: '아이디 또는 비밀번호 오류' });
  }
  res.json({ message: '로그인 성공', user });
});

app.get('/users', (req, res) => {
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`✅ 백엔드 서버 실행 중: http://localhost:${PORT}`);
});
