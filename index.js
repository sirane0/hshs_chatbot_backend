const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 서버 메모리상에 사용자 목록 저장 (실제 서비스용 DB 아님, 서버 재시작 시 초기화됨)
let users = [];

// ✅ CORS 설정: 프론트엔드가 배포된 도메인만 허용
app.use(cors({
  origin: "https://sirane0.github.io",  // 실제 프론트엔드 URL로 변경하세요
  credentials: true                     // 쿠키 및 인증정보 허용
}));

// ✅ 클라이언트가 JSON 형태로 보낸 요청 바디를 파싱하기 위한 미들웨어
app.use(bodyParser.json());

// ===========================
// ✅ 회원가입 API
// 1) 클라이언트가 보내온 JSON 바디가 잘 도착하는지 로그 출력
// 2) 필수 항목(id, password, name, role) 검증
// 3) 중복 아이디 확인
// 4) 새 사용자 객체 생성 및 메모리 배열에 저장
// 5) 저장된 배열 상태를 서버 콘솔에 출력(디버깅 목적)
// 6) 성공 응답 전송
// ===========================
app.post('/register', (req, res) => {
  console.log('회원가입 요청 바디:', req.body);

  const { id, password, name, role, year, studentId } = req.body;

  // 필수 값 누락 시 400 에러 반환
  if (!id || !password || !name || !role) {
    return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
  }

  // 중복 아이디 확인: 이미 존재하면 400 에러 반환
  const exists = users.find(u => u.id === id);
  if (exists) {
    return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });
  }

  // 새 사용자 객체 생성 및 배열에 추가
  const newUser = { id, password, name, role, year, studentId };
  users.push(newUser);

  // 현재 배열 상태 출력 (디버깅용)
  console.log('현재 저장된 사용자 목록:', users);

  // 회원가입 성공 응답(201 Created)
  res.status(201).json({ message: '회원가입 성공', user: newUser });
});

// ===========================
// ✅ 로그인 API
// 1) id, password 입력 확인
// 2) users 배열에서 아이디와 비밀번호 일치하는 사용자 찾기
// 3) 없으면 401 에러, 있으면 사용자 정보 응답
// ===========================
app.post('/login', (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요.' });
  }

  // 단순 평문 비교(보안상 취약) — 실제 서비스시 해시 사용 권장
  const user = users.find(u => u.id === id && u.password === password);

  if (!user) {
    return res.status(401).json({ message: '아이디 또는 비밀번호 오류' });
  }

  res.json({ message: '로그인 성공', user });
});

// ===========================
// ✅ 사용자 전체 목록 반환 (중복 체크 등에 활용)
// ===========================
app.get('/users', (req, res) => {
  res.json(users);
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
