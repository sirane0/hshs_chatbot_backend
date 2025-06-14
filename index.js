const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 서버 메모리에 사용자 정보를 저장하는 배열
// 실제 서비스에서는 DB를 사용해야 하지만, 여기서는 간단한 예제로 메모리 사용
let users = []; 

// CORS 설정: 오직 https://sirane0.github.io 도메인에서만 API 요청을 허용
// credentials: true 설정으로 쿠키, 인증 헤더 등의 자격 증명 포함 요청 가능하게 함
app.use(cors({
  origin: "https://sirane0.github.io",
  credentials: true
}));

// 요청 본문이 JSON 형태임을 인식하고 파싱해주는 미들웨어
app.use(bodyParser.json());

/**
 * 회원가입 API
 * - POST /register
 * - 클라이언트가 JSON 형식으로 id, password, name, role, year, studentId를 보냄
 * - 필수 항목(id, password, name, role) 누락 시 400 에러 반환
 * - 이미 동일한 id가 존재하면 400 에러 반환
 * - 신규 사용자 정보를 배열에 저장 후 201 상태코드와 함께 성공 메시지 및 사용자 정보 반환
 */
app.post('/register', (req, res) => {
  const { id, password, name, role, year, studentId } = req.body;

  // 필수 항목 체크
  if (!id || !password || !name || !role) {
    return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
  }

  // 기존 사용자 중복 검사
  const exists = users.find(u => u.id === id);
  if (exists) {
    return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });
  }

  // 사용자 객체 생성 및 저장
  const newUser = { id, password, name, role, year, studentId };
  users.push(newUser);

  // 성공 응답 반환
  res.status(201).json({ message: '회원가입 성공', user: newUser });
});

/**
 * 로그인 API
 * - POST /login
 * - 클라이언트가 JSON 형식으로 id와 password를 보냄
 * - id, password 누락 시 400 에러 반환
 * - users 배열에서 id, password가 일치하는 사용자 탐색
 * - 일치하는 사용자가 없으면 401 인증 실패 응답 반환
 * - 성공 시 로그인 성공 메시지와 사용자 정보 반환
 */
app.post('/login', (req, res) => {
  const { id, password } = req.body;

  // 필수 입력 체크
  if (!id || !password) {
    return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
  }

  // 사용자 인증
  const user = users.find(u => u.id === id && u.password === password);
  if (!user) {
    return res.status(401).json({ message: '아이디 또는 비밀번호 오류' });
  }

  // 로그인 성공 응답
  res.json({ message: '로그인 성공', user });
});

/**
 * 사용자 전체 목록 반환 API
 * - GET /users
 * - 회원가입 중복체크 등 클라이언트에서 사용자 목록이 필요할 때 호출
 * - users 배열 전체를 JSON으로 반환
 */
app.get('/users', (req, res) => {
  res.json(users);
});

// 서버 시작 및 지정 포트에서 리스닝
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
