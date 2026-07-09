"use client";

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  ArrowUpDown,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { StudentFeeStatusBadge } from "@/components/students/student-fee-status-badge";
import { StudentProfileDrawer } from "@/components/students/student-profile-drawer";
import { ConfirmationDialog } from "@/components/ui-extra/confirmation-dialog";
// import { deleteStudents } from "@/lib/actions/students-actions";
import { exportToCsv } from "@/lib/csv-export";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { StudentRow } from "@/types/students";
import { deleteStudents } from "@/lib/action/students-actions";

interface StudentsTableProps {
  students: StudentRow[];
}

export function StudentsTable({ students }: StudentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const columns = useMemo<ColumnDef<StudentRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Student <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-slate-100 text-xs font-medium text-slate-600">
                {row.original.avatarInitials}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-slate-900">
              {row.original.name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "course",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Course <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-slate-600">{row.original.course}</span>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-slate-600">{row.original.phone}</span>
        ),
      },
      {
        accessorKey: "attendancePct",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Attendance <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-slate-600">
            {row.original.attendancePct !== null
              ? `${row.original.attendancePct}%`
              : "—"}
          </span>
        ),
      },
      {
        accessorKey: "feeStatus",
        header: "Fee Status",
        cell: ({ row }) => (
          <StudentFeeStatusBadge status={row.original.feeStatus} />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-slate-500"
            onClick={() => setActiveStudentId(row.original.id)}
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
        ),
        enableSorting: false,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: students,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const selectedIds = Object.keys(rowSelection);

  function handleExport() {
    const rows = (
      selectedIds.length > 0
        ? table.getSelectedRowModel().rows
        : table.getFilteredRowModel().rows
    ).map((r) => ({
      Name: r.original.name,
      Course: r.original.course,
      Phone: r.original.phone,
      "Attendance %": r.original.attendancePct ?? "",
      "Fee Status": r.original.feeStatus,
      "Balance Due": r.original.balanceDue,
      "Joined On": r.original.joinedAt,
    }));
    exportToCsv("students.csv", rows);
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteStudents(selectedIds);
      if (result.success) {
        toast.success(
          `${result.deletedCount} student${result.deletedCount === 1 ? "" : "s"} deleted`,
        );
        setRowSelection({});
        setConfirmDeleteOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Couldn't delete students");
      }
    });
  }

  return (
    <>
      <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search students…"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <>
                <span className="text-sm text-slate-500">
                  {selectedIds.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => setConfirmDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleExport}
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {table.getRowModel().rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-400">
            {students.length === 0
              ? "No students yet — add your first admission."
              : "No students match your search."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400"
                  >
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3 font-medium">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {Math.max(table.getPageCount(), 1)}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      <StudentProfileDrawer
        studentId={activeStudentId}
        onOpenChange={(open) => !open && setActiveStudentId(null)}
      />

      <ConfirmationDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={`Delete ${selectedIds.length} student${selectedIds.length === 1 ? "" : "s"}?`}
        description="This permanently removes their attendance, fee, and test records too. This can't be undone."
        confirmLabel="Delete"
        destructive
        isPending={isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
