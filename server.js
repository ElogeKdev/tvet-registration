 const express = require("express");
const db = require("./dbConnect");

const app = express();
app.use(express.json());

// ---------------- STUDENTS ----------------
app.post("/students", (req, res) => {
  const { full_name, email } = req.body;

  // FIX 1: validate required fields before querying
  if (!full_name || !email) {
    return res.status(400).json({ error: "full_name and email are required" });
  }

  const sql = "INSERT INTO students (full_name, email) VALUES (?, ?)";
  db.query(sql, [full_name, email], (err, result) => {
    if (err) {
      // FIX 2: handle duplicate email clearly
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Email already exists" });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: "Student registered successfully",
      student_id: result.insertId
    });
  });
});

app.get("/students", (req, res) => {
  db.query("SELECT * FROM students", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ---------------- COURSES ----------------
app.post("/courses", (req, res) => {
  const { course_name, course_code } = req.body;

  // FIX 3: validate required fields
  if (!course_name || !course_code) {
    return res.status(400).json({ error: "course_name and course_code are required" });
  }

  const sql = "INSERT INTO courses (course_name, course_code) VALUES (?, ?)";
  db.query(sql, [course_name, course_code], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Course code already exists" });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: "Course added successfully",
      course_id: result.insertId
    });
  });
});

app.get("/courses", (req, res) => {
  db.query("SELECT * FROM courses", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ---------------- ENROLLMENTS ----------------
app.post("/enrollments", (req, res) => {
  const { student_id, course_id } = req.body;

  // FIX 4: validate required fields
  if (!student_id || !course_id) {
    return res.status(400).json({ error: "student_id and course_id are required" });
  }

  const sql = "INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)";
  db.query(sql, [student_id, course_id], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Student already enrolled in this course" });
      }
      // FIX 5: catch invalid student_id or course_id (foreign key violation)
      if (err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(404).json({ error: "Student or course not found" });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: "Enrollment successful",
      enrollment_id: result.insertId
    });
  });
});

app.get("/enrollments", (req, res) => {
  const sql = `
    SELECT e.enrollment_id, s.full_name, c.course_name
    FROM enrollments e
    JOIN students s ON e.student_id = s.student_id
    JOIN courses c ON e.course_id = c.course_id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ---------------- SERVER ----------------
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});