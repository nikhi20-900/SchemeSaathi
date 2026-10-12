-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- The application manages schema via SQLAlchemy; this script only enables the extension.
