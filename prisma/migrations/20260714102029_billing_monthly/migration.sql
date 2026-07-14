-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "billingCycle" "BillingCycle" NOT NULL DEFAULT 'ONE_TIME';

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "enrollmentStatus" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE';
