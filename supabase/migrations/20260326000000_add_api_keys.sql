-- api_keys 테이블: 사용자 발급 API 키 관리
-- key_hash: SHA-256 해시만 저장 (원본 키는 저장하지 않음)
-- key_prefix: 목록 식별용 앞 16자리 (예: sk_live_a1b2c3d4)

CREATE TABLE IF NOT EXISTS api_keys (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  key_hash     TEXT NOT NULL,
  key_prefix   TEXT NOT NULL,
  name         TEXT DEFAULT 'Default',
  created_at   TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  is_active    BOOLEAN DEFAULT true
);

CREATE UNIQUE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys(key_hash);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own api keys"
ON api_keys FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
