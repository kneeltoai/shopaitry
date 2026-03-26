-- items.board_id を UUID → BIGINT に変更 (boards.id が BIGINT のため)
-- 既存の UUID 値は BIGINT に変換不可のため NULL にリセット
ALTER TABLE items DROP CONSTRAINT IF EXISTS items_board_id_fkey;
ALTER TABLE items ALTER COLUMN board_id TYPE BIGINT USING NULL;

-- FK 再設定
ALTER TABLE items
  ADD CONSTRAINT items_board_id_fkey
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE SET NULL;
