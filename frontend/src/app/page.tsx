"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">


      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl space-y-8"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900">
            Manage your team's tasks with precision.
          </h1>
          <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
            A production-grade task management platform built for speed, security, and enterprise-level scale. Start orchestrating your projects today.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-lg">
                Get Started for Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="py-6 text-center text-zinc-500 text-sm border-t">
        © {new Date().getFullYear()} Flowgrid Team Task Manager. All rights reserved.
      </footer>
    </div>
  );
}
