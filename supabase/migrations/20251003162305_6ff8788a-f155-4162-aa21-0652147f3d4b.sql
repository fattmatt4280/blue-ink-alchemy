-- Add reference images column to expert knowledge base
ALTER TABLE expert_knowledge_base 
ADD COLUMN IF NOT EXISTS reference_images text[] DEFAULT '{}'::text[];

COMMENT ON COLUMN expert_knowledge_base.reference_images IS 'Array of image URLs showing visual examples of this condition';