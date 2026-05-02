"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import api from "@/lib/axios";

// Import Dashboard Components
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { UserList } from "@/components/dashboard/UserList";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { CreateProject } from "@/components/dashboard/CreateProject";
import { MemberProjectList } from "@/components/dashboard/MemberProjectList";
import { MissedDeadlines } from "@/components/dashboard/MissedDeadlines";
import { ProjectListAdmin } from "@/components/dashboard/ProjectListAdmin";
import { TaskAssignment } from "@/components/dashboard/TaskAssignment";

function DashboardContent() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      if (user?.role === 'ADMIN') {
        const [dashRes, usersRes, projRes] = await Promise.all([
          api.get("/dashboard"),
          api.get("/users"),
          api.get("/projects")
        ]);
        setDashboardData(dashRes.data);
        setUsers(usersRes.data);
        setProjects(projRes.data.projects);
      } else {
        // If not admin, fetch their projects and tasks
        const [projRes, taskRes] = await Promise.all([
          api.get("/projects"),
          api.get("/tasks")
        ]);
        setProjects(projRes.data.projects);
        setTasks(taskRes.data.tasks);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchDashboardData();
    }
  }, [isAuthenticated, router, fetchDashboardData]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-zinc-50/50 p-4 sm:p-8 pt-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {user?.role === 'ADMIN' ? 'Admin Workspace' : 'My Workspace'}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {user?.role === 'ADMIN' ? 'Manage your organization, projects, and track team progress.' : 'View your assigned projects and updates.'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-32 flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-zinc-500 font-medium tracking-wide">Loading workspace data...</p>
          </div>
        ) : (
          <>
            {user?.role === 'ADMIN' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12 pb-20">
                
                {/* BLOCK 1: Metrics & Deadlines */}
                <section id="overview" className="space-y-6 scroll-mt-24">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-800 border-b pb-2">Overview</h2>
                  <MetricsCards metrics={dashboardData?.metrics} />
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 h-[400px]">
                      <MissedDeadlines tasks={dashboardData?.overdueTasksList || []} />
                    </div>
                    <div id="activity" className="h-[400px] overflow-y-auto hidden lg:block bg-white rounded-xl border border-zinc-200 shadow-sm scroll-mt-24">
                       <ActivityTimeline activities={dashboardData?.timeline?.slice(0, 10) || []} onClearHistory={fetchDashboardData} />
                    </div>
                  </div>
                </section>

                {/* BLOCK 2: Current Projects */}
                <section id="projects" className="space-y-6 scroll-mt-24">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-800 border-b pb-2">Current Projects</h2>
                  <ProjectListAdmin 
                    projects={projects} 
                    onProjectDeleted={fetchDashboardData} 
                  />
                </section>

                {/* BLOCK 3: Create Project */}
                <section className="space-y-6">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-800 border-b pb-2">Create New Project</h2>
                  <CreateProject onCreated={fetchDashboardData} />
                </section>

                {/* BLOCK 4: Task Assignment */}
                <section className="space-y-6">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-800 border-b pb-2">Assign Tasks</h2>
                  <TaskAssignment 
                    projects={projects} 
                    users={users} 
                    onAssigned={fetchDashboardData} 
                  />
                </section>

                {/* BLOCK 5: User Directory */}
                <section id="users" className="space-y-6 scroll-mt-24">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-800 border-b pb-2">User Directory</h2>
                  <UserList users={users} />
                </section>

              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <MemberProjectList 
                  projects={projects} 
                  tasks={tasks} 
                  onStatusUpdated={fetchDashboardData} 
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
