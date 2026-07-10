"use client";

import { Dispatch, SetStateAction } from "react";
import { Menu, ChevronLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

import SidebarItem from "./SidebarItem";
import { navigation } from "./navigation";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-5">
        {!collapsed && (
          <div>
            <h2 className="text-xl font-bold text-slate-900">ClassPilot</h2>

            <p className="text-xs text-slate-500">Institute OS</p>
          </div>
        )}

        {/* Desktop Collapse */}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="hidden rounded-lg p-2 transition hover:bg-slate-100 lg:block"
          aria-label="Toggle Sidebar"
        >
          {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Mobile Close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-2 transition hover:bg-slate-100 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {navigation.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            collapsed={collapsed}
            active={pathname === item.href}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t p-4">
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
            <h3 className="font-semibold">AI Assistant</h3>

            <p className="mt-1 text-sm opacity-90">Coming Soon 🚀</p>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{
          width: collapsed ? 88 : 260,
        }}
        transition={{
          duration: 0.25,
        }}
        className="sticky top-0 hidden h-screen flex-col border-r bg-white lg:flex"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r bg-white shadow-xl lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
