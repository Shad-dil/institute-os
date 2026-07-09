"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface SidebarItemProps {
  title: string;
  href: string;
  icon: LucideIcon;
  active?: boolean;
  collapsed?: boolean;
}

export default function SidebarItem({
  title,
  href,
  icon: Icon,
  active,
  collapsed,
}: SidebarItemProps) {
  console.log(href);
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={clsx(
          "flex items-center gap-3 rounded-xl px-3 py-3 transition-all",
          active
            ? "bg-blue-600 text-white shadow-md"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />

        {!collapsed && <span className="font-medium">{title}</span>}
      </motion.div>
    </Link>
  );
}
