-- SismoSmart CMS foundation. Do not apply until the existing empty cPanel
-- database has been backed up and a dedicated, limited-privilege DB user exists.
-- This script adds tables only; it does not modify any existing object.
-- MariaDB/MySQL compatible; JSON payload validation is enforced in the app.

CREATE TABLE IF NOT EXISTS cms_content (
  locale VARCHAR(8) NOT NULL,
  content_key VARCHAR(128) NOT NULL,
  draft_json LONGTEXT NULL,
  published_json LONGTEXT NULL,
  version INT UNSIGNED NOT NULL DEFAULT 0,
  published_version INT UNSIGNED NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (locale, content_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cms_revision (
  locale VARCHAR(8) NOT NULL,
  content_key VARCHAR(128) NOT NULL,
  version INT UNSIGNED NOT NULL,
  action VARCHAR(16) NOT NULL,
  content_json LONGTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (locale, content_key, version),
  KEY cms_revision_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
