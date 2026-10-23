import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import FaviconSync from "@/components/FaviconSync";

export default function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen lg:flex">
      <FaviconSync />
      <Sidebar />
      <MobileNav />

      <main className="min-w-0 flex-1">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:py-8">
            <Outlet />
          </div>
        </motion.div>
      </main>
    </div>
  );
}