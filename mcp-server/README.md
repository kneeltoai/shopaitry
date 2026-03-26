# Shopaitry MCP Server

AI 에이전트(Claude 등)가 Shopaitry 위시보드를 네이티브 도구로 사용할 수 있는 MCP 서버입니다.

## 사용 예시

Claude에게:
- "소니 헤드폰 추천해서 내 Shopaitry에 넣어줘"
- "내 위시리스트 보여줘"
- "5만원 이하 아이템 전부 '살 예정'으로 바꿔줘"
- "전자기기 보드 만들고 거기에 맥북 링크 저장해줘"

## 설치

```bash
cd mcp-server
npm install
npm run build
```

## API 키 발급

1. [Shopaitry](https://shopaitry.vercel.app) 로그인
2. 설정 → API 키 → 새 키 발급

## Claude Desktop 연결

`~/.claude/claude_desktop_config.json` (Mac) 또는
`%APPDATA%\Claude\claude_desktop_config.json` (Windows) 에 추가:

```json
{
  "mcpServers": {
    "shopaitry": {
      "command": "node",
      "args": ["C:/절대경로/shopaitry/mcp-server/dist/index.js"],
      "env": {
        "SHOPAITRY_API_KEY": "sk_live_발급받은키",
        "SHOPAITRY_SERVER_URL": "https://shopaitry.vercel.app"
      }
    }
  }
}
```

## Claude Code 연결

```bash
claude mcp add shopaitry \
  -e SHOPAITRY_API_KEY=sk_live_발급받은키 \
  -- node /절대경로/shopaitry/mcp-server/dist/index.js
```

## 제공 도구

| 도구 | 설명 |
|------|------|
| `list_boards` | 보드 목록 조회 |
| `create_board` | 새 보드 생성 |
| `delete_board` | 보드 삭제 |
| `list_items` | 아이템 목록 조회 (보드 필터 가능) |
| `add_item` | URL로 아이템 추가 (메타데이터 자동 추출) |
| `update_item` | 아이템 상태·제목·가격 수정 |
| `delete_item` | 아이템 삭제 |

## 아이템 상태

- `wish` — 찜 (기본값)
- `to_buy` — 살 예정
- `bought` — 구매 완료

## 환경변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `SHOPAITRY_API_KEY` | API 키 (필수) | — |
| `SHOPAITRY_SERVER_URL` | 서버 URL | `https://shopaitry.vercel.app` |
