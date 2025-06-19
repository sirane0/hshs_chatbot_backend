const fs = require("fs");
const bcrypt = require("bcrypt");

// user.json을 불러옴
const users = JSON.parse(fs.readFileSync("user.json", "utf8"));

const saltRounds = 10;

// 모든 사용자의 비밀번호를 bcrypt로 해시
async function hashPasswords() {
  for (let user of users) {
    if (!user.pw.startsWith("$2b$")) {  // 이미 해시된 비밀번호는 제외
      user.pw = await bcrypt.hash(user.pw, saltRounds);
    }
  }

  // 덮어쓰기
  fs.writeFileSync("user.json", JSON.stringify(users, null, 2), "utf8");
  console.log("✅ 모든 비밀번호를 해시 처리했습니다.");
}

hashPasswords();
