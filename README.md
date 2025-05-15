# Baemin 리뷰 자동 답글 봇

Baemin(배달의 민족) 셀프 서비스 리뷰 페이지에서 고객 리뷰를 자동으로 읽어와, AI(Google Gemini)를 이용해 사장님 댓글을 생성하고 등록하는 Node.js 스크립트입니다.

---

## 주요 기능

* 로그인 후 지정된 매장의 리뷰 페이지 접속
* 신규 리뷰(아직 사장님 댓글이 없는)만 필터링
* 고객 이름과 리뷰 내용을 AI에 전달해 감정과 문제점을 반영한 답글 생성
* 기존 댓글(pre‑filled 텍스트) 삭제 후 AI 답글 입력
* “등록” 버튼 클릭으로 답글 전송
* 처리한 리뷰 ID를 `processedReviews.json`에 저장해 중복 처리 방지

---

## 요구 사항

* Node.js v16 이상
* npm 또는 yarn
* Google Gemini API 키
* 배민 셀프 서비스 로그인 계정(ID, PW)

---

## 설치 및 설정

1. 저장소 클론

   ```bash
   git clone https://github.com/yourusername/baemin-review-bot.git
   cd baemin-review-bot
   ```

2. 의존성 설치

   ```bash
   npm install
   # or
   yarn install
   ```

3. 환경 변수 설정
   프로젝트 루트에 `.env` 파일을 만들고 다음 값을 입력하세요:

   ```ini
   BAEMIN_ID=배민 ID
   BAEMIN_PW=배민 PW
   BAEMIN_PAGE=리뷰 페이지 URL
   BAEMIN_STORE_NAME=가게 이름
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. `.gitignore` 파일을 확인해 `node_modules/`, `.env`, `processedReviews.json`이 무시되도록 설정되어 있는지 확인하세요.

---

## 사용 방법

```bash
node index.js
```

* `headless: false` 옵션을 통해 브라우저 UI를 직접 보면서 디버깅할 수 있습니다.
* 한 번 실행하면 `processedReviews.json`에 처리된 리뷰 ID가 기록되어, 이후 중복 처리되지 않습니다.

---

## 파일 구조

```
├── index.js                  # 메인 로직 스크립트
├── reply-gemini.js           # Gemini API 호출 모듈
├── processedReviews.json     # 처리된 리뷰 ID 저장소
├── .env                      # 환경 변수 (Git에 커밋하지 마세요)
├── .gitignore                # Git 무시 설정
├── package.json
└── README.md
```

---

## 라이선스

본 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.
