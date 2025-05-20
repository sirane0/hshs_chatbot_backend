const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

let users = []; // 서버 메모리에 임시 저장 (재시작 시 초기화됨)

// CORS 설정
app.use(cors({
  origin: 'https://hshschatbot0.github.io', // 프론트엔드 도메인
  credentials: true
}));

// JSON 파싱 미들웨어
app.use(bodyParser.json());

// 회원가입 API
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

// 로그인 API
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

// 전체 유저 조회 API (관리용)
app.get('/users', (req, res) => {
  res.json(users);
});

// 서버 시작
app.listen(PORT, () => console.log(`✅ 백엔드 서버 실행 중: http://localhost:${PORT}`));


// 서버 시작
app.listen(PORT, () => {
  console.log(`✅ 백엔드 서버 실행 중: http://localhost:${PORT}`);
});
