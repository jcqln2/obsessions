-- Collage items: images, notes, and links pinned to entry collages
-- Run in Supabase SQL Editor after review (human-approved)

CREATE TABLE IF NOT EXISTS collage_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('image', 'note', 'link')),
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  rotation_degrees FLOAT NOT NULL DEFAULT 0,
  scale_factor FLOAT NOT NULL DEFAULT 1,
  width_px INT NOT NULL,
  height_px INT NOT NULL,
  z_index INT NOT NULL DEFAULT 0,
  image_url TEXT,
  storage_path TEXT,
  text_content TEXT,
  link_url TEXT,
  link_label VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT collage_items_image_fields CHECK (
    item_type != 'image'
    OR (image_url IS NOT NULL AND storage_path IS NOT NULL)
  ),
  CONSTRAINT collage_items_note_fields CHECK (
    item_type != 'note' OR text_content IS NOT NULL
  ),
  CONSTRAINT collage_items_link_fields CHECK (
    item_type != 'link' OR link_url IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_collage_items_entry_id ON collage_items(entry_id);

-- Migrate existing images
INSERT INTO collage_items (
  id,
  entry_id,
  item_type,
  position_x,
  position_y,
  rotation_degrees,
  scale_factor,
  width_px,
  height_px,
  z_index,
  image_url,
  storage_path,
  created_at
)
SELECT
  id,
  entry_id,
  'image',
  position_x,
  position_y,
  rotation_degrees,
  scale_factor,
  width_px,
  height_px,
  z_index,
  image_url,
  storage_path,
  created_at
FROM images
ON CONFLICT (id) DO NOTHING;

ALTER TABLE collage_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage collage items for own entries"
  ON collage_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM entries e
      WHERE e.id = collage_items.entry_id AND e.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM entries e
      WHERE e.id = collage_items.entry_id AND e.user_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.collage_items TO authenticated;
