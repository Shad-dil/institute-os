"use client";

import { useState } from "react";
import { Menu, ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import SidebarItem from "./SidebarItem";
import { navigation } from "./navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{
        width: collapsed ? 88 : 260,
      }}
      transition={{
        duration: 0.25,
      }}
      className="sticky top-0 h-screen border-r bg-white"
    >
      {/* Logo */}

      <div className="flex h-16 items-center justify-between border-b px-5">
        {!collapsed && (
          <div>
            <h2 className="text-xl font-bold">ClassPilot</h2>

            <p className="text-xs text-slate-500">Institute OS</p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}

      <nav className="space-y-2 p-4">
        {navigation.map((item) => (
          <SidebarItem
            key={item.href}
            {...item}
            collapsed={collapsed}
            active={pathname === item.href}
          />
        ))}
      </nav>

      {/* Bottom */}

      <div className="absolute bottom-5 left-4 right-4">
        {!collapsed && (
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
            <p className="font-semibold">AI Assistant</p>

            <p className="mt-1 text-sm opacity-80">Coming Soon 🚀</p>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
