CREATE TABLE IF NOT EXISTS comments (
  id         TEXT    PRIMARY KEY,
  set_slug   TEXT    NOT NULL,
  word_slug  TEXT,
  author     TEXT    NOT NULL,
  body       TEXT    NOT NULL,
  created_at INTEGER NOT NULL,
  ip_hash    TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_recent
  ON comments (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_set
  ON comments (set_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_word
  ON comments (set_slug, word_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_ratelimit
  ON comments (ip_hash, created_at DESC);
