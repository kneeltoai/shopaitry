import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
const API_KEY = process.env['SHOPAITRY_API_KEY'] ?? '';
const SERVER_URL = process.env['SHOPAITRY_SERVER_URL'] ?? 'https://shopaitry.vercel.app';
// ── API helper ────────────────────────────────────────────────────────
async function apiCall(method, path, body) {
    const response = await fetch(`${SERVER_URL}/api/v1${path}`, {
        method,
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message ?? `API error: ${response.status}`);
    }
    return response.json();
}
function toText(data) {
    return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    };
}
// ── MCP Server ────────────────────────────────────────────────────────
const server = new McpServer({
    name: 'shopaitry',
    version: '1.0.0',
});
// ── Tools ─────────────────────────────────────────────────────────────
server.tool('list_boards', '모든 보드 목록을 조회합니다', {}, async () => {
    const result = await apiCall('GET', '/boards');
    return toText(result);
});
server.tool('create_board', '새 쇼핑 보드를 생성합니다', {
    name: z.string().min(1).describe('보드 이름'),
}, async ({ name }) => {
    const result = await apiCall('POST', '/boards', { name });
    return toText(result);
});
server.tool('delete_board', '보드를 삭제합니다. 보드 내 아이템은 보드 미지정 상태로 유지됩니다.', {
    id: z.number().int().positive().describe('삭제할 보드 ID'),
}, async ({ id }) => {
    const result = await apiCall('DELETE', `/boards/${id}`);
    return toText(result);
});
server.tool('list_items', '아이템 목록을 조회합니다. board_id를 지정하면 해당 보드의 아이템만 반환합니다.', {
    board_id: z.number().int().positive().optional().describe('보드 ID로 필터링 (선택)'),
}, async ({ board_id }) => {
    const path = board_id !== undefined ? `/items?board_id=${board_id}` : '/items';
    const result = await apiCall('GET', path);
    return toText(result);
});
server.tool('add_item', 'URL을 Shopaitry 위시보드에 저장합니다. URL만 넣으면 제목·이미지·가격을 자동으로 추출합니다.', {
    url: z.string().url().describe('저장할 상품 URL'),
    board_id: z.number().int().positive().optional().describe('보드 ID (선택)'),
    title: z.string().optional().describe('상품 제목 (없으면 자동 추출)'),
    price: z.number().nonnegative().optional().describe('가격 원화 (없으면 자동 추출)'),
    thumbnail_url: z.string().url().optional().describe('썸네일 이미지 URL (없으면 자동 추출)'),
}, async ({ url, board_id, title, price, thumbnail_url }) => {
    const body = { url };
    if (board_id !== undefined)
        body['board_id'] = board_id;
    if (title !== undefined)
        body['title'] = title;
    if (price !== undefined)
        body['price'] = price;
    if (thumbnail_url !== undefined)
        body['thumbnail_url'] = thumbnail_url;
    const result = await apiCall('POST', '/items', body);
    return toText(result);
});
server.tool('update_item', '아이템 정보를 수정합니다. 상태(wish/to_buy/bought), 제목, 가격을 변경할 수 있습니다.', {
    id: z.number().int().positive().describe('수정할 아이템 ID'),
    status: z
        .enum(['wish', 'to_buy', 'bought'])
        .optional()
        .describe('새 상태: wish(찜) | to_buy(살 예정) | bought(구매완료)'),
    title: z.string().optional().describe('새 제목'),
    price: z.number().nonnegative().optional().describe('새 가격 (원화)'),
}, async ({ id, status, title, price }) => {
    const updates = {};
    if (status !== undefined)
        updates['status'] = status;
    if (title !== undefined)
        updates['title'] = title;
    if (price !== undefined)
        updates['price'] = price;
    const result = await apiCall('PATCH', `/items/${id}`, updates);
    return toText(result);
});
server.tool('delete_item', '아이템을 삭제합니다', {
    id: z.number().int().positive().describe('삭제할 아이템 ID'),
}, async ({ id }) => {
    const result = await apiCall('DELETE', `/items/${id}`);
    return toText(result);
});
// ── Entry point ───────────────────────────────────────────────────────
async function main() {
    if (!API_KEY) {
        console.error('Error: SHOPAITRY_API_KEY 환경변수가 설정되지 않았습니다.');
        console.error('Usage: SHOPAITRY_API_KEY=sk_live_... node dist/index.js');
        process.exit(1);
    }
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`Shopaitry MCP Server running on stdio (server: ${SERVER_URL})`);
}
main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
