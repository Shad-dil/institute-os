import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Fixed identity for the seeded institute/owner, so this script is safe to
// re-run — it deletes anything with this email first. Deleting the
// Institute row cascades through every related table (Course, Student,
// Batch, Test, Attendance, Invoice, Payment, TestResult, Note, User) since
// they're all set up with onDelete: Cascade back to Institute, directly or
// transitively.
// ---------------------------------------------------------------------------
const INSTITUTE_EMAIL = "hello@abccomputeracademy.in";
const OWNER_EMAIL = "owner@abccomputeracademy.in";
const OWNER_PASSWORD = "password123"; // plaintext, only for you to log in with after seeding

const STUDENT_NAMES = [
  "Ananya Sharma", "Rohit Verma", "Priya Nair", "Karan Mehta", "Sneha Patil",
  "Suresh Iyer", "Aditya Kulkarni", "Neha Joshi", "Vikram Singh", "Pooja Reddy",
  "Amit Deshmukh", "Kavita Rao", "Rahul Gupta", "Divya Menon", "Arjun Yadav",
  "Meera Pillai", "Sanjay Choudhary", "Ritu Agarwal", "Manish Tiwari", "Swati Bhatt",
  "Deepak Chauhan", "Anjali Saxena", "Vivek Malhotra", "Preeti Kapoor",
];

const PARENT_NAMES = [
  "Rajesh Sharma", "Sunita Verma", "Mohan Nair", "Geeta Mehta", "Ramesh Patil",
  "Lakshmi Iyer", "Prakash Kulkarni", "Sarita Joshi", "Harish Singh", "Kamala Reddy",
];

const FACULTY_NAMES = ["Amit Deshmukh", "Priya Nair", "Suresh Iyer", "Neha Kulkarni", "Rajeev Thakur"];

const COURSES = [
  { name: "Web Development", fees: 15000, duration: "4 Months" },
  { name: "Python & Data", fees: 12000, duration: "3 Months" },
  { name: "Tally & Accounts", fees: 8000, duration: "2 Months" },
  { name: "Spoken English", fees: 6000, duration: "2 Months" },
  { name: "Office Automation", fees: 7000, duration: "6 Weeks" },
];

function randomPhone(): string {
  const first = ["6", "7", "8", "9"][Math.floor(Math.random() * 4)];
  let rest = "";
  for (let i = 0; i < 9; i++) rest += Math.floor(Math.random() * 10);
  return first + rest;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Cleaning up any previous seed run for this institute...");
  await prisma.institute.deleteMany({ where: { email: INSTITUTE_EMAIL } });

  console.log("Creating institute...");
  const institute = await prisma.institute.create({
    data: { name: "ABC Computer Academy", email: INSTITUTE_EMAIL },
  });

  console.log("Creating owner login...");
  const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 10);
  await prisma.user.create({
    data: {
      name: "Ravi Kumar",
      email: OWNER_EMAIL,
      passwordHash,
      role: "OWNER",
      instituteId: institute.id,
    },
  });

  console.log("Creating courses...");
  const courses = await Promise.all(
    COURSES.map((c) =>
      prisma.course.create({
        data: { ...c, instituteId: institute.id },
      })
    )
  );

  console.log("Creating batches...");
  const batches = [];
  for (const course of courses) {
    const batchCount = randomInt(1, 2);
    for (let i = 0; i < batchCount; i++) {
      const isMorning = i === 0;
      const batch = await prisma.batch.create({
        data: {
          courseId: course.id,
          instituteId: institute.id,
          name: isMorning ? "Morning Batch" : "Evening Batch",
          schedule: isMorning
            ? "Mon, Wed, Fri · 9:00–10:30 AM"
            : "Mon, Wed, Fri · 6:00–7:30 PM",
          facultyName: FACULTY_NAMES[randomInt(0, FACULTY_NAMES.length - 1)],
          capacity: randomInt(15, 30),
          startDate: daysAgo(randomInt(30, 90)),
        },
      });
      batches.push({ ...batch, courseId: course.id });
    }
  }

  console.log("Creating students, invoices, payments, attendance...");
  let nameIndex = 0;
  for (const course of courses) {
    const courseBatches = batches.filter((b) => b.courseId === course.id);
    const studentsForCourse = randomInt(3, 6);

    for (let i = 0; i < studentsForCourse && nameIndex < STUDENT_NAMES.length; i++) {
      const name = STUDENT_NAMES[nameIndex++];
      const batch = Math.random() > 0.15 ? courseBatches[randomInt(0, courseBatches.length - 1)] : null;
      const joinedDaysAgo = randomInt(10, 120);

      const student = await prisma.student.create({
        data: {
          name,
          email: Math.random() > 0.4 ? `${name.split(" ")[0].toLowerCase()}@example.com` : null,
          phone: randomPhone(),
          parentName: Math.random() > 0.2 ? PARENT_NAMES[randomInt(0, PARENT_NAMES.length - 1)] : null,
          parentPhone: Math.random() > 0.2 ? randomPhone() : null,
          joinedAt: daysAgo(joinedDaysAgo),
          instituteId: institute.id,
          courseId: course.id,
          batchId: batch?.id ?? null,
        },
      });

      // --- Invoice + payments: cycle through PAID / PARTIAL / PENDING / OVERDUE ---
      const statusRoll = nameIndex % 4;
      const totalAmount = course.fees;

      if (statusRoll === 0) {
        // PAID in full
        const invoice = await prisma.invoice.create({
          data: {
            amount: totalAmount,
            amountPaid: totalAmount,
            dueDate: daysAgo(joinedDaysAgo - 3),
            paidAt: daysAgo(joinedDaysAgo - 2),
            status: "PAID",
            studentId: student.id,
          },
        });
        await prisma.payment.create({
          data: { invoiceId: invoice.id, amount: totalAmount, method: "CASH", paidAt: daysAgo(joinedDaysAgo - 2) },
        });
      } else if (statusRoll === 1) {
        // PARTIAL
        const paidSoFar = Math.round(totalAmount * 0.5);
        const invoice = await prisma.invoice.create({
          data: {
            amount: totalAmount,
            amountPaid: paidSoFar,
            dueDate: daysFromNow(randomInt(2, 10)),
            paidAt: daysAgo(randomInt(1, 10)),
            status: "PARTIAL",
            studentId: student.id,
          },
        });
        await prisma.payment.create({
          data: { invoiceId: invoice.id, amount: paidSoFar, method: "UPI", paidAt: daysAgo(randomInt(1, 10)) },
        });
      } else if (statusRoll === 2) {
        // PENDING — due date still in the future
        await prisma.invoice.create({
          data: {
            amount: totalAmount,
            amountPaid: 0,
            dueDate: daysFromNow(randomInt(3, 15)),
            status: "PENDING",
            studentId: student.id,
          },
        });
      } else {
        // OVERDUE — due date already passed, nothing paid
        await prisma.invoice.create({
          data: {
            amount: totalAmount,
            amountPaid: 0,
            dueDate: daysAgo(randomInt(2, 20)),
            status: "PENDING", // effectiveStatus() in the app derives OVERDUE from this + today's date
            studentId: student.id,
          },
        });
      }

      // --- Attendance: last ~20 weekdays, mostly present ---
      const attendanceDays = Math.min(20, joinedDaysAgo);
      for (let d = 0; d < attendanceDays; d++) {
        const date = daysAgo(d);
        if (date.getDay() === 0) continue; // skip Sundays

        const roll = Math.random();
        const status = roll < 0.83 ? "PRESENT" : roll < 0.93 ? "ABSENT" : "LATE";

        await prisma.attendance.create({
          data: { studentId: student.id, date, status },
        });
      }

      // --- Occasional note ---
      if (Math.random() > 0.75) {
        await prisma.note.create({
          data: {
            studentId: student.id,
            content:
              Math.random() > 0.5
                ? "Spoke with parent about attendance — assured it will improve."
                : "Requested fee extension, follow up next week.",
          },
        });
      }
    }
  }

  console.log("Creating tests and results...");
  for (const course of courses) {
    const students = await prisma.student.findMany({ where: { courseId: course.id }, select: { id: true } });
    if (students.length === 0) continue;

    const testCount = randomInt(1, 2);
    for (let t = 0; t < testCount; t++) {
      const test = await prisma.test.create({
        data: {
          name: `${course.name} — Unit Test ${t + 1}`,
          maxMarks: 100,
          testDate: daysAgo(randomInt(3, 30)),
          courseId: course.id,
          instituteId: institute.id,
        },
      });

      for (const student of students) {
        // Leave a couple of students ungraded to show a realistic
        // "marks entered X/Y" partial state on the Tests list.
        if (Math.random() > 0.85) continue;

        await prisma.testResult.create({
          data: {
            testId: test.id,
            studentId: student.id,
            marksObtained: randomInt(38, 98),
          },
        });
      }
    }
  }

  const counts = {
    courses: await prisma.course.count({ where: { instituteId: institute.id } }),
    batches: await prisma.batch.count({ where: { instituteId: institute.id } }),
    students: await prisma.student.count({ where: { instituteId: institute.id } }),
    invoices: await prisma.invoice.count({ where: { student: { instituteId: institute.id } } }),
    payments: await prisma.payment.count({ where: { invoice: { student: { instituteId: institute.id } } } }),
    attendance: await prisma.attendance.count({ where: { student: { instituteId: institute.id } } }),
    tests: await prisma.test.count({ where: { instituteId: institute.id } }),
    testResults: await prisma.testResult.count({ where: { student: { instituteId: institute.id } } }),
    notes: await prisma.note.count({ where: { student: { instituteId: institute.id } } }),
  };

  console.log("\nSeed complete:");
  console.table(counts);
  console.log(`\nLog in with:\n  email:    ${OWNER_EMAIL}\n  password: ${OWNER_PASSWORD}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
