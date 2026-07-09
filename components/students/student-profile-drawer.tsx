"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeeStatusBadge } from "@/components/fees/fee-status-badge";
import { AddNoteForm } from "@/components/students/add-note-form";
import { Mail, Phone } from "lucide-react";
import type { StudentProfile } from "@/types/students";

interface StudentProfileDrawerProps {
  studentId: string | null;
  onOpenChange: (open: boolean) => void;
}

const ATTENDANCE_DOT: Record<string, string> = {
  PRESENT: "bg-green-500",
  LATE: "bg-amber-500",
  ABSENT: "bg-red-400",
};

export function StudentProfileDrawer({ studentId, onOpenChange }: StudentProfileDrawerProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = useCallback(() => {
    if (!studentId) return;
    setLoading(true);
    fetch(`/api/students/${studentId}/profile`)
      .then((res) => res.json())
      .then((data: StudentProfile) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    if (studentId) loadProfile();
    else setProfile(null);
  }, [studentId, loadProfile]);

  return (
    <Sheet open={studentId !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {loading || !profile ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            {loading ? "Loading…" : "Select a student to view their profile."}
          </div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-blue-50 text-lg font-semibold text-blue-600">
                    {profile.avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle>{profile.name}</SheetTitle>
                  <SheetDescription>
                    {profile.course} · Joined {profile.joinedAt}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="fees">Fees</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              {/* --- Overview --- */}
              <TabsContent value="overview" className="space-y-4 pt-4">
                <div className="rounded-lg border border-slate-100 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Contact
                  </p>
                  <div className="space-y-1.5 text-sm">
                    <p className="flex items-center gap-2 text-slate-700">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> {profile.phone}
                    </p>
                    {profile.email && (
                      <p className="flex items-center gap-2 text-slate-700">
                        <Mail className="h-3.5 w-3.5 text-slate-400" /> {profile.email}
                      </p>
                    )}
                  </div>
                </div>

                {(profile.parentName || profile.parentPhone) && (
                  <div className="rounded-lg border border-slate-100 p-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Guardian
                    </p>
                    <div className="space-y-1.5 text-sm text-slate-700">
                      {profile.parentName && <p>{profile.parentName}</p>}
                      {profile.parentPhone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400" /> {profile.parentPhone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-slate-100 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Test Results
                  </p>
                  {profile.testResults.length === 0 ? (
                    <p className="text-sm text-slate-400">No tests recorded yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {profile.testResults.map((tr) => (
                        <li key={tr.testId} className="flex items-center justify-between text-sm">
                          <div>
                            <p className="font-medium text-slate-900">{tr.testName}</p>
                            <p className="text-xs text-slate-400">{tr.testDate}</p>
                          </div>
                          <span className="font-medium text-slate-700">
                            {tr.marksObtained}/{tr.maxMarks} ({tr.percentage}%)
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>

              {/* --- Attendance --- */}
              <TabsContent value="attendance" className="space-y-4 pt-4">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
                  <span className="text-sm text-slate-500">Overall Attendance</span>
                  <span className="text-2xl font-semibold text-slate-900">
                    {profile.attendancePct !== null ? `${profile.attendancePct}%` : "—"}
                  </span>
                </div>

                {profile.attendanceRecords.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">No attendance marked yet.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {profile.attendanceRecords.map((record, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between rounded-lg border border-slate-50 px-3 py-2 text-sm"
                      >
                        <span className="text-slate-600">{record.date}</span>
                        <span className="flex items-center gap-1.5 font-medium text-slate-700">
                          <span className={`h-2 w-2 rounded-full ${ATTENDANCE_DOT[record.status]}`} />
                          {record.status.charAt(0) + record.status.slice(1).toLowerCase()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              {/* --- Fees --- */}
              <TabsContent value="fees" className="space-y-3 pt-4">
                {profile.invoices.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">No fee records yet.</p>
                ) : (
                  profile.invoices.map((inv) => (
                    <div key={inv.id} className="rounded-lg border border-slate-100 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Due {inv.dueDate}</span>
                        <FeeStatusBadge status={inv.status} />
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-slate-400">Total</p>
                          <p className="font-medium text-slate-900">₹{inv.totalAmount.toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Paid</p>
                          <p className="font-medium text-green-600">₹{inv.amountPaid.toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Balance</p>
                          <p className="font-medium text-slate-900">₹{inv.balanceDue.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              {/* --- Notes --- */}
              <TabsContent value="notes" className="space-y-4 pt-4">
                <AddNoteForm studentId={profile.id} onAdded={loadProfile} />

                {profile.notes.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-400">No notes yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {profile.notes.map((note) => (
                      <li key={note.id} className="rounded-lg bg-slate-50 p-3">
                        <p className="text-sm text-slate-700">{note.content}</p>
                        <p className="mt-1 text-xs text-slate-400">{note.createdAt}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
