-- items 테이블에 가격 컬럼 추가
ALTER TABLE items ADD COLUMN IF NOT EXISTS price INTEGER;
ALTER TABLE items ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'KRW';
ALTER TABLE items ADD COLUMN IF NOT EXISTS price_raw TEXT;

-- price_history 테이블 생성
CREATE TABLE IF NOT EXISTS price_history (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id    UUID REFERENCES items(id) ON DELETE CASCADE,
  price      INTEGER NOT NULL,
  currency   TEXT DEFAULT 'KRW',
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- price_history RLS 정책
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'price_history' AND policyname = 'Users can view own price history'
  ) THEN
    CREATE POLICY "Users can view own price history"
    ON price_history FOR SELECT
    USING (
      item_id IN (SELECT id FROM items WHERE user_id = auth.uid())
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'price_history' AND policyname = 'System can insert price history'
  ) THEN
    CREATE POLICY "System can insert price history"
    ON price_history FOR INSERT
    WITH CHECK (
      item_id IN (SELECT id FROM items WHERE user_id = auth.uid())
    );
  END IF;
END
$$;
