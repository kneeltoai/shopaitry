-- status 컬럼 추가 (이미 있으면 무시)
ALTER TABLE items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'wish';

-- items DELETE RLS 정책
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'items' AND policyname = 'Users can delete own items'
  ) THEN
    CREATE POLICY "Users can delete own items"
    ON items FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END
$$;

-- boards DELETE RLS 정책
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'boards' AND policyname = 'Users can delete own boards'
  ) THEN
    CREATE POLICY "Users can delete own boards"
    ON boards FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END
$$;

-- items UPDATE RLS 정책 (status 변경용)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'items' AND policyname = 'Users can update own items'
  ) THEN
    CREATE POLICY "Users can update own items"
    ON items FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END
$$;
