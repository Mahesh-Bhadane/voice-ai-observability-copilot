const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'db.sqlite'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    script TEXT NOT NULL,
    success_criteria TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS calls (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    transcript TEXT NOT NULL,
    duration_sec INTEGER NOT NULL,
    caller TEXT NOT NULL,
    started_at TEXT NOT NULL,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  );

  CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    call_id TEXT NOT NULL UNIQUE,
    score INTEGER NOT NULL,
    flags TEXT NOT NULL,
    use_actions TEXT NOT NULL,
    summary TEXT NOT NULL,
    analyzed_at TEXT NOT NULL,
    FOREIGN KEY (call_id) REFERENCES calls(id)
  );

  CREATE TABLE IF NOT EXISTS recommendations (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    content TEXT NOT NULL,
    generated_at TEXT NOT NULL,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
  );
`);

module.exports = db;
