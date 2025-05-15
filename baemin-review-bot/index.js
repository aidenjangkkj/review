// index.js
require('dotenv').config();
const fs = require('fs');
const puppeteer = require('puppeteer');
const { generateReplyWithGemini } = require('./reply-gemini');

(async () => {
  const processedFile = './processedReviews.json';
  let processed = [];
  if (fs.existsSync(processedFile)) {
    try {
      processed = JSON.parse(fs.readFileSync(processedFile, 'utf8'));
    } catch (e) {
      console.error('⚠️ processedReviews.json 파싱 에러, 새로운 파일을 생성합니다.');
      processed = [];
      fs.writeFileSync(processedFile, JSON.stringify(processed));
    }
  } else {
    // 최초 실행 시 빈 배열로 파일 생성
    fs.writeFileSync(processedFile, JSON.stringify(processed));
  }

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    defaultViewport: null,
    args: ['--start-maximized'],
  });
  const page = await browser.newPage();

  // 1) 로그인
  await page.goto('https://self.baemin.com/login', { waitUntil: 'networkidle2' });
  await page.waitForSelector('input[name="id"]');
  await page.type('input[name="id"]', process.env.BAEMIN_ID);
  await page.type('input[name="password"]', process.env.BAEMIN_PW);
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
  ]);

  // 2) 리뷰 페이지 이동
  await page.goto(BAEMIN_PAGE, { waitUntil: 'networkidle2' });

  // 3) 모든 리뷰 컨테이너 순회
  const reviewContainers = await page.$$("div[class*='ReviewContent-module__']");
  for (const container of reviewContainers) {
    // 리뷰 ID 추출 (이미지 파일명 또는 텍스트 해시)
    const reviewId = await container.evaluate(el => {
      const img = el.querySelector('img');
      if (img && img.src) return img.src.split('/').pop().split('.')[0];
      return el.innerText.slice(0, 30).replace(/\s/g, '');
    });
    if (processed.includes(reviewId)) continue;

    // 댓글 버튼 확인
    const [replyBtn] = await container.$x(".//button[.//span[text()='사장님 댓글 등록하기']]");
    if (!replyBtn) {
      // 댓글 불필요 리뷰 차후 스킵
      processed.push(reviewId);
      fs.writeFileSync(processedFile, JSON.stringify(processed));
      continue;
    }

    // 리뷰어 이름과 내용 추출
    const { name, text } = await container.evaluate(el => {
      const nameEl = el.querySelector("span[data-atelier-component='Typography']");
      const reviewer = nameEl?.innerText.trim() || '고객님';
      const spans = Array.from(el.querySelectorAll("span[data-atelier-component='Typography']"));
      const reviewEl = spans.find(s => s.innerText.trim().length > reviewer.length + 10);
      return { name: reviewer, text: reviewEl?.innerText.trim() || '' };
    });
    console.log(`🔄 ${name}님 리뷰 처리 중...`);

    // 댓글 작성
    await replyBtn.click();
    const editorHandle = await container.waitForSelector('div.ReviewCommentEditor-module__tWEv', { visible: true, timeout: 10000 });
    const textareaHandle = await editorHandle.$('textarea');
    if (!textareaHandle) {
      console.error('⚠️ textarea를 찾을 수 없습니다.');
      processed.push(reviewId);
      fs.writeFileSync(processedFile, JSON.stringify(processed));
      continue;
    }
    await textareaHandle.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');

    let reply = await generateReplyWithGemini(name, text);
    reply = reply.replace(/"/g, '');
    await textareaHandle.type(reply);

    const [submitBtn] = await editorHandle.$x(".//button[.//p[text()='등록']]");
    if (submitBtn) await submitBtn.click();
    console.log('✅ AI 답글이 성공적으로 등록되었습니다.');

    // 처리 완료 ID 기록
    processed.push(reviewId);
    fs.writeFileSync(processedFile, JSON.stringify(processed));
    await page.waitForTimeout(1000);
  }

  console.log('🏁 모든 신규 리뷰 처리 완료');
  await browser.close();
})();
