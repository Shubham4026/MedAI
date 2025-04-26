-- Add Google OAuth tokens to users table
ALTER TABLE users
ADD COLUMN google_access_token TEXT,
ADD COLUMN google_refresh_token TEXT,
ADD COLUMN google_token_expiry TIMESTAMP;
