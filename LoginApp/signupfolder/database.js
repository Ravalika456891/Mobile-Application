/*import * as SQLite from "expo-sqlite";

console.log("🚨🚨🚨 THIS IS MY CURRENT DATABASE.JS 🚨🚨🚨");

let db = null;

export const initDatabase = async () => {
  try {
    if(db){
      return db;
    }
    console.log("Opening SQLite database...");
    const db = await SQLite.openDatabaseAsync("RavalikaApp.db");
    console.log("SQLite database opened");
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        NAME TEXT NOT NULL,
        AGE INTEGER NOT NULL,
        MOBILE TEXT NOT NULL,
        GENDER TEXT NOT NULL,
        BLOODGROUP TEXT NOT NULL,
        ADDRESS TEXT NOT NULL,
        ALTERNATEPHONE TEXT NOT NULL,
        EMAIL TEXT NOT NULL,
        NEWPASSWORD TEXT NOT NULL,
        CONFIRMEDPWD TEXT NOT NULL
      );
    `);
    const columns = await db.getAllAsync(`PRAGMA table_info(users);`);

   // console.log("📋 USERS TABLE COLUMNS:", columns);  
    console.log("✅ Users table created/verified");
    return db;
  } catch (error) {
    console.log("❌ Database initialization error:", error);
    throw error;
  }
};
export const getDatabase = () => {
  if (!db) {
    throw new Error("Database is not initialized");
  }
  return db;
};*/
import * as SQLite from "expo-sqlite";

console.log("🚨 CURRENT DATABASE.JS 🚨");

let db = null;

export const initDatabase = async () => {
  try {

    // Already initialized
    if (db) {
      return db;
    }

    console.log("Opening SQLite database...");

    // IMPORTANT: no const here
    db = await SQLite.openDatabaseAsync("RavalikaApp.db");

    console.log("SQLite database opened");

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        NAME TEXT NOT NULL,
        AGE INTEGER NOT NULL,
        MOBILE TEXT NOT NULL,
        GENDER TEXT NOT NULL,
        BLOODGROUP TEXT NOT NULL,
        ADDRESS TEXT NOT NULL,
        ALTERNATEPHONE TEXT NOT NULL,
        EMAIL TEXT NOT NULL,
        NEWPASSWORD TEXT NOT NULL,
        CONFIRMEDPWD TEXT NOT NULL
      );
    `);

    console.log("✅ Users table created/verified");

    return db;

  } catch (error) {

    console.log("❌ Database initialization error:", error);

    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error("Database is not initialized");
  }
  return db;
};