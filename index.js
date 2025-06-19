// 필수 라이브러리 불러오기
const express = require('express');              // Express 웹 서버 프레임워크
const bodyParser = require('body-parser');      // 요청 본문(JSON 등) 파싱용 미들웨어
const cors = require('cors');                   // CORS 허용 미들웨어
const fs = require('fs');                       // 파일 시스템 접근 모듈
const path = require('path');                   // 경로 조작을 위한 유틸리티
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Express 앱 생성
const app = express();
const PORT = process.env.PORT || 3000;          // 환경 변수 포트 또는 기본 3000번 사용

// 사용자 정보 저장할 JSON 파일 경로 설정
const DATA_FILE = path.join(__dirname, 'users.json');

// 미들웨어 등록
app.use(cors());                                // 모든 출처의 요청 허용
app.use(bodyParser.json());                     // JSON 본문 자동 파싱

// 사용자 목록 변수 (서버 메모리용)
let users = [];

// 서버 시작 시, users.json 파일을 읽어 사용자 정보 불러오기
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE);     // 파일 읽기
    users = JSON.parse(raw);                    // JSON 파싱하여 메모리(users)에 복원
  } catch (err) {
    console.error('users.json 파싱 오류:', err); // 파싱 실패 시 콘솔에 오류 출력
    users = [];                                 // 오류 시 빈 배열로 초기화
  }
}

// 사용자 정보를 파일에 저장하는 함수
function saveUsersToFile() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2)); // 들여쓰기 2칸으로 저장
}

// ---------------------------
// 회원가입 API
// ---------------------------
app.post('/register', (req, res) => {
  const { id, password, name, role } = req.body;        // 클라이언트에서 전송한 사용자 정보 추출

  const exists = users.find(u => u.id === id);          // 중복된 아이디가 있는지 확인
  if (exists) {
    return res.status(400).json({ message: '이미 존재하는 아이디입니다.' }); // 중복 시 오류 응답
  }

  const newUser = { id, password, name, role };         // 새 사용자 객체 생성
  users.push(newUser);                                  // 메모리에 추가
  saveUsersToFile();                                     // 파일에 저장

  res.status(201).json({ message: '회원가입 성공' });    // 성공 응답
});

// ---------------------------
// 로그인 API
// ---------------------------
app.post('/login', async (req, res) => {
  const { id, password } = req.body;                    // 로그인 요청 정보 추출
  const user = users.find(u => u.id === id ); // ID 일치 확인
  const isMatch = await bcrypt.compare(password, user.password);

  if (!user) {
    return res.status(401).json({ message: '아이디 또는 비밀번호 오류' }); // 실패 응답
  }

  res.json({ message: '로그인 성공', user });           // 로그인 성공 시 사용자 정보와 함께 응답
});

// ---------------------------
// 모든 사용자 목록 반환 API (관리용)
// ---------------------------
app.get('/users', (req, res) => {
  res.json(users);                                       // 전체 사용자 목록 JSON으로 반환
});

// ---------------------------
// 클라이언트(localStorage)에서 업로드된 사용자 정보 병합 API
// ---------------------------
app.post('/import-users', (req, res) => {
  const { importedUsers } = req.body;                   // 클라이언트가 전송한 사용자 리스트

  if (!Array.isArray(importedUsers)) {
    return res.status(400).json({ message: '잘못된 사용자 형식입니다.' }); // 유효성 검사 실패
  }

  let added = 0; // 병합된 사용자 수 카운트

  for (const user of importedUsers) {
    const { id, password, name, role } = user;

    // 이미 서버에 없는 ID만 추가
    if (!users.find(u => u.id === id)) {
      users.push({ id, password, name, role });
      added++;
    }
  }

  saveUsersToFile(); // 병합 후 저장
  res.json({ message: `${added}명의 사용자 계정이 병합되었습니다.` }); // 결과 응답
});

// ---------------------------
// 서버 실행
// ---------------------------
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));