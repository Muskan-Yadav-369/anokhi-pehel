const express = require("express");
const Student = require("../models/Student");
const Test = require("../models/TestScore");
const router = express.Router();
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const app = express();

app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + "-" + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

let upload = multer({ storage, fileFilter });
app.use(express.urlencoded({ extended: true }));
// Serve uploaded photos
app.use("/uploads", express.static("uploads"));

router.route("/addStudent").post(upload.single("photo"), async (req, res) => {
  const name = req.body.name;
  const className = req.body.class;
  const phone = req.body.phone;
  const location = req.body.location;
  const mode = req.body.mode;
  const dob = req.body.dob;
  const aadhar = req.body.aadhar;
  const address = req.body.address;
  const school = req.body.school;
  const photo = req.file.filename;

  // console.log(name, "", className, "", location, " ", photo);

  try {
    const newStudentData = {
      name,
      className,
      phone,
      location,
      mode,
      dob,
      aadhar,
      address,
      school,
      photo,
    };

    const newStudent = new Student(newStudentData);

    await newStudent.save();
    res.json("Student Added");
  } catch (error) {
    console.error(error);
    res.status(400).json("Error: " + error.message);
  }
});

router.get("/studentList", async (req, res) => {
  try {
    const students = await Student.find();
    // console.log(students);
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/getstudentByUserId", async (req, res) => {
  // Extract the user ID from the request query parameters
  const student_id = req.query.studentid;

  try {
    // Query the database to retrieve the user based on the ID
    const student = await Student.findById(student_id);
    // console.log(student);
    // Check if the user exists
    if (!student) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getMarksByUserId", async (req, res) => {
  try {
    const studentId = req.query.studentid;
    // console.log(studentId);
    const marks = await Test.find({ "score.studentId": studentId });
    // console.log(marks);

    if (marks && marks.length > 0) {
      res.json(marks);
    } else {
      console.log("Data not found");
      res.json({ message: "Data not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/students", async (req, res) => {
  try {
    const selectedClass = req.query.class; // Get the selected class from the query parameters

    // Query the database to find students by the className
    const students = await Student.find({ className: selectedClass });

    res.json(students); // Send the list of students as a JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/getStudentByUserId", async (req, res) => {
  // Extract the user ID from the request query parameters
  try {
    // Extract the studentIds from the request body
    const { studentIds } = req.body;

    // Query the database to retrieve student names based on IDs
    const students = await Student.find({ _id: { $in: studentIds } });

    // Extract student names from the retrieved data
    const studentNames = students.map((student) => ({
      _id: student._id,
      name: student.name,
    }));

    res.json(studentNames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;