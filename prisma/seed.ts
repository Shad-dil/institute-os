import { PrismaClient, AttendanceStatus, InvoiceStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clean up existing data to prevent duplicates
  await prisma.invoice.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.student.deleteMany();
  await prisma.course.deleteMany();
  await prisma.institute.deleteMany();

  // 2. Create a Mock Institute
  const institute = await prisma.institute.create({
    data: {
      name: "Apex Computer Classes & Coaching",
      email: "contact@apexclasses.com",
    },
  });

  console.log(`🏢 Created Institute: ${institute.name}`);

  // 3. Create Mock Courses
  const pythonCourse = await prisma.course.create({
    data: {
      name: "Python Programming (Masterclass)",
      fees: 4500.0,
      duration: "3 Months",
      instituteId: institute.id,
    },
  });

  const webDevCourse = await prisma.course.create({
    data: {
      name: "Full-Stack Web Development",
      fees: 12000.0,
      duration: "6 Months",
      instituteId: institute.id,
    },
  });

  console.log("📚 Created Courses: Python and Web Dev");

  // 4. Create Mock Students
  const studentsData = [
    { name: "Rahul Sharma", phone: "9876543210", courseId: pythonCourse.id },
    { name: "Priya Patel", phone: "9812345678", courseId: pythonCourse.id },
    { name: "Amit Kumar", phone: "9988776655", courseId: webDevCourse.id },
    { name: "Sneha Reddy", phone: "8877665544", courseId: webDevCourse.id },
    { name: "Vikram Singh", phone: "7766554433", courseId: pythonCourse.id },
  ];

  const students = [];
  for (const student of studentsData) {
    const createdStudent = await prisma.student.create({
      data: {
        name: student.name,
        phone: student.phone,
        parentName: `Parent of ${student.name.split(" ")[0]}`,
        parentPhone: "9000011111",
        instituteId: institute.id,
        courseId: student.courseId,
      },
    });
    students.push(createdStudent);
  }

  console.log(`👥 Created ${students.length} students.`);

  // 5. Create Mock Attendance (for Today)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize time to midnight

  const statuses: AttendanceStatus[] = [
    "PRESENT",
    "PRESENT",
    "ABSENT",
    "PRESENT",
    "LATE",
  ];

  for (let i = 0; i < students.length; i++) {
    await prisma.attendance.create({
      data: {
        date: today,
        status: statuses[i],
        studentId: students[i].id,
      },
    });
  }
  console.log("📅 Attendance logs generated for today.");

  // 6. Create Mock Invoices
  // Let's make some paid and some pending/overdue bills
  const invoiceStatuses: InvoiceStatus[] = [
    "PAID",
    "PENDING",
    "OVERDUE",
    "PAID",
    "PENDING",
  ];

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const isPaid = invoiceStatuses[i] === "PAID";

    // Fetch course details to get the exact amount
    const currentCourse =
      student.courseId === pythonCourse.id ? pythonCourse : webDevCourse;

    await prisma.invoice.create({
      data: {
        amount: currentCourse.fees,
        dueDate: new Date(
          Date.now() + (i === 2 ? -5 : 10) * 24 * 60 * 60 * 1000,
        ), // Overdue is 5 days ago, pending is 10 days from now
        status: invoiceStatuses[i],
        paidAt: isPaid ? new Date() : null,
        studentId: student.id,
      },
    });
  }

  console.log("💰 Color-coded invoices created.");
  console.log("🎉 Seeding successfully completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
