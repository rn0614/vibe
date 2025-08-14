-- Add completed_at column to tb_todolist table
-- This column will store the timestamp when a todo item is marked as completed
-- NULL value indicates the todo is not completed yet

ALTER TABLE tb_todolist 
ADD COLUMN completed_at TIMESTAMPTZ NULL;

-- Add comment to the column for documentation
COMMENT ON COLUMN tb_todolist.completed_at IS 'Timestamp when the todo item was marked as completed. NULL indicates not completed.';

-- Create an index for better query performance when filtering by completion status
CREATE INDEX idx_tb_todolist_completed_at ON tb_todolist(completed_at);

-- Create a partial index for incomplete todos (more efficient for common queries)
CREATE INDEX idx_tb_todolist_incomplete ON tb_todolist(id) WHERE completed_at IS NULL AND deleted_at IS NULL;
