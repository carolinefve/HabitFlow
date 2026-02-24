import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("habitflow.db");

export default db;
