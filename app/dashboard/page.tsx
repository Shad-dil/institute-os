import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { AdmissionsChart } from "@/components/dashboard/admissions-chart";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { CourseDistributionChart } from "@/components/dashboard/course-distribution-chart";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { UpcomingPanel } from "@/components/dashboard/upcoming-panel";
import { AnnouncementsCard } from "@/components/dashboard/announcements-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { getCurrentInstituteId } from "@/lib/queries/institute";
import {
  getStatCards,
  getRevenueTrend,
  getAdmissionsTrend,
  getAttendanceWeek,
  getCourseDistribution,
  getRecentActivity,
  getUpcomingFeeDues,
} from "@/lib/queries/dashboard-queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const instituteId = await getCurrentInstituteId();

  const [
    statCards,
    revenueTrend,
    admissionsTrend,
    attendanceWeek,
    courseDistribution,
    recentActivity,
    upcomingFeeDues,
  ] = await Promise.all([
    getStatCards(instituteId),
    getRevenueTrend(instituteId),
    getAdmissionsTrend(instituteId),
    getAttendanceWeek(instituteId),
    getCourseDistribution(instituteId),
    getRecentActivity(instituteId),
    getUpcomingFeeDues(instituteId),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Welcome Back 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Today looks like a productive day.
        </p>
      </div>

      <QuickActions />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <StatCard key={stat.id} data={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard
          title="Money Collected"
          description="Fees collected each month"
          className="lg:col-span-2"
        >
          <RevenueChart data={revenueTrend} />
        </ChartCard>
        <ChartCard
          title="Students by Course"
          description="How many in each course"
        >
          <CourseDistributionChart data={courseDistribution} />
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2 h-100 overflow-x-scroll">
          <RecentActivityFeed items={recentActivity} />
          {/* <AnnouncementsCard /> */}
        </div>
        <UpcomingPanel fees={upcomingFeeDues} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="New Admissions"
          description="Students joined each month"
        >
          <AdmissionsChart data={admissionsTrend} />
        </ChartCard>
        <ChartCard
          title="Attendance This Week"
          description="Who showed up, who didn't"
        >
          <AttendanceChart data={attendanceWeek} />
        </ChartCard>
      </div>
    </div>
  );
}
