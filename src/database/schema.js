import db from "./db";

export const initDatabase = async () => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      theme VARCHAR DEFAULT 'light',
      notification_frequency VARCHAR DEFAULT 'normal'
    );

    CREATE TABLE IF NOT EXISTS habit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      habit_name VARCHAR NOT NULL,
      category VARCHAR,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_tracked BOOLEAN DEFAULT 1,
      frequency VARCHAR,
      preferred_time TIME,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES user(id)
    );

    CREATE TABLE IF NOT EXISTS deadline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      deadline_name VARCHAR NOT NULL,
      description VARCHAR,
      due_date DATETIME,
      FOREIGN KEY (user_id) REFERENCES user(id)
    );

    CREATE TABLE IF NOT EXISTS agenda_item (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      deadline_id INTEGER,
      habit_id INTEGER,
      quick_task_name VARCHAR,
      date DATE,
      start_time TIME,
      end_time TIME,
      is_completed BOOLEAN DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES user(id),
      FOREIGN KEY (deadline_id) REFERENCES deadline(id),
      FOREIGN KEY (habit_id) REFERENCES habit(id)
    );

    CREATE TABLE IF NOT EXISTS completion_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (habit_id) REFERENCES habit(id)
    );
  `);
};

export default db;
