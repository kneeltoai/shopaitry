# Shopaitry Chrome Extension

한 클릭으로 현재 보고 있는 상품을 Shopaitry에 저장하는 크롬 확장프로그램.

브라우저에서 직접 DOM을 읽으므로 쿠팡·네이버 등 봇 차단 문제를 우회합니다.

## 설치 방법

1. `chrome://extensions` 접속
2. 우측 상단 **개발자 모드** 토글 켜기
3. **압축 해제된 확장 프로그램 로드** 클릭
4. `chrome-extension/` 폴더 선택
5. 확장프로그램 아이콘 클릭 → API 키 설정

## 초기 설정

1. [Shopaitry 설정 페이지](https://shopaitry.vercel.app/settings)에서 API 키 발급
2. 확장프로그램 아이콘 클릭 → ⚙️ 설정 → API 키 입력 → 저장

## 사용법

1. 쇼핑몰 상품 페이지에서 확장프로그램 아이콘 클릭
2. 자동 추출된 상품명·가격 확인 (필요 시 수정)
3. 보드 선택 (선택사항)
4. **저장하기** 클릭

## 파일 구조

```
chrome-extension/
├── manifest.json     # Manifest V3 설정
├── content.js        # 페이지 DOM에서 상품 정보 추출
├── background.js     # Service worker (최소화)
├── popup.html        # 팝업 UI 구조
├── popup.js          # 팝업 로직
├── popup.css         # 팝업 스타일
└── icons/            # 아이콘 파일
```

## 지원 사이트

- 무신사, 29CM, 에이블리 등 OG 메타 지원 사이트 ✅
- 쿠팡, 네이버 스마트스토어 (DOM 직접 읽기로 봇 차단 우회) ✅
- 소니, 애플 등 글로벌 스토어 ✅
- 메르카리, 라쿠텐 등 해외 사이트 ✅

## 권한 안내

| 권한 | 이유 |
|------|------|
| `activeTab` | 현재 탭의 URL·콘텐츠 접근 |
| `storage` | API 키·서버 URL 저장 |
