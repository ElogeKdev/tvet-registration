 const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tvet_registration",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1); // stop the app if DB fails
  } else {
    console.log("Iri connected humura ✅✔️");
  }
});

module.exports = db;