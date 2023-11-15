import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { getDataPath } from "electron-json-storage";
import path from "path";
import log from "../logger";

export async function openDb() {
  return await open({
    filename: path.join(getDataPath(), "sqlite.db"),
    driver: sqlite3.cached.Database,
  });
}
(async () => {
  log.info("Initializing SQLite DB...");
  const db = await openDb();
  db.run(`PRAGMA foreign_keys = ON;`);
  // Create LightrailKBSource Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS KBSource (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recursive BOOLEAN,
      uri TEXT,
      frequency TEXT,
      refreshedAt INTEGER
    )
  `);

  // Create LightrailKBDocument Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS KBDocument (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uri TEXT,
      title TEXT,
      type TEXT,
      hash TEXT,
      refreshedAt INTEGER,
      sourceId INTEGER,
      FOREIGN KEY(sourceId) REFERENCES KBSource(id) ON DELETE CASCADE
    )
  `);

  // Create LightrailKBItem Table
  await db.run(`
    CREATE TABLE IF NOT EXISTS KBItem (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      type TEXT,
      hash TEXT,
      refreshedAt INTEGER,
      documentId INTEGER, 
      FOREIGN KEY(documentId) REFERENCES KBDocument(id) ON DELETE CASCADE
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS KBTags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag TEXT UNIQUE
    )
  `);

  // Join Tables
  await db.run(`
    CREATE TABLE IF NOT EXISTS KBSource_KBTags (
      sourceId INTEGER,
      tagId INTEGER,
      FOREIGN KEY(sourceId) REFERENCES KBSource(id) ON DELETE CASCADE,
      FOREIGN KEY(tagId) REFERENCES KBTags(id) ON DELETE CASCADE,
      PRIMARY KEY(sourceId, tagId)
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS KBDocument_KBTags (
      documentId INTEGER,
      tagId INTEGER,
      FOREIGN KEY(documentId) REFERENCES KBDocument(id) ON DELETE CASCADE,
      FOREIGN KEY(tagId) REFERENCES KBTags(id) ON DELETE CASCADE,
      PRIMARY KEY(documentId, tagId)
    )
  `);
  await db.run(`
    CREATE TABLE IF NOT EXISTS KBItem_KBTags (
      itemId INTEGER,
      tagId INTEGER,
      FOREIGN KEY(itemId) REFERENCES KBItem(id) ON DELETE CASCADE,
      FOREIGN KEY(tagId) REFERENCES KBTags(id) ON DELETE CASCADE,
      PRIMARY KEY(itemId, tagId)
    )
  `);
  log.info("Done initializing SQLite DB.");
})();
