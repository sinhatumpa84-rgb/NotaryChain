-- Seed data for local development
INSERT INTO users (firebase_uid, email, first_name, last_name, role)
VALUES ('local-dev-user', 'admin@example.com', 'Local', 'Admin', 'admin')
ON CONFLICT DO NOTHING;
