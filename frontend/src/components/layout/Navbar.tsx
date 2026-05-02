"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserCircle, LogOut, LayoutDashboard, Settings, FolderKanban, Users, Activity, LayoutGrid } from "lucide-react";
import { useState, useRef, useEffect, Suspense } from "react";

function NavbarContent() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      logout();
      setDropdownOpen(false);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navLinks = user?.role === 'ADMIN' ? [
    { name: "Overview", id: "overview", icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
    { name: "Projects", id: "projects", icon: <FolderKanban className="w-4 h-4 mr-2" /> },
    { name: "Users", id: "users", icon: <Users className="w-4 h-4 mr-2" /> },
    { name: "Activity", id: "activity", icon: <Activity className="w-4 h-4 mr-2" /> },
  ] : [
    { name: "My Projects", id: "overview", icon: <FolderKanban className="w-4 h-4 mr-2" /> }
  ];

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center mr-8">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-2">
                <LayoutGrid className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-zinc-900 tracking-tight">Flowgrid</span>
            </Link>
            
            {isAuthenticated && (
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                {navLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(link.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                        // Update URL hash without jumping
                        window.history.pushState(null, '', `#${link.id}`);
                      }
                    }}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 cursor-pointer`}
                  >
                    {link.icon}
                    {link.name}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="relative ml-3" ref={dropdownRef}>
                <button
                  type="button"
                  className="flex items-center max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 hover:bg-zinc-50 transition-colors">
                    <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-zinc-700 hidden sm:block">{user?.name}</span>
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-zinc-100 flex items-start gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{user?.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                        <div className="mt-1 flex items-center">
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${user?.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {user?.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link href="/profile" className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-md flex items-center transition-colors">
                        <Settings className="w-4 h-4 mr-2 text-zinc-400" />
                        Account Settings
                      </Link>
                    </div>
                    <div className="p-2 border-t border-zinc-100">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-4">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Navbar() {
  return (
    <Suspense fallback={<div className="h-16 bg-white border-b border-zinc-200"></div>}>
      <NavbarContent />
    </Suspense>
  );
}
