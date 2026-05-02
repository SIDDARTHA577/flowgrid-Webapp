"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Folder, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import api from "@/lib/axios";
import { useState } from "react";

interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: { name: string; email: string };
  createdAt: string;
  metrics?: { total: number; completed: number };
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  projectId: { _id: string; name: string };
  status: string;
  dueDate?: string;
}

interface MemberProjectListProps {
  projects: Project[];
  tasks: Task[];
  onStatusUpdated: () => void;
}

export function MemberProjectList({ projects, tasks, onStatusUpdated }: MemberProjectListProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    setUpdatingId(taskId);
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      onStatusUpdated();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update task status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-12">
      
      {/* SECTION: Assigned Tasks */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-bold tracking-tight text-zinc-800">My Assigned Tasks</h2>
        </div>
        
        {tasks.length === 0 ? (
          <Card className="text-center py-12 border-dashed">
            <CardContent className="pt-6">
              <div className="mx-auto w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900">No Pending Tasks</h3>
              <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
                You have no tasks assigned to you right now. Great job!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {tasks.map((task) => (
              <Card key={task._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 border-b border-zinc-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-indigo-700">{task.title}</CardTitle>
                      <CardDescription className="text-xs font-semibold uppercase tracking-wider mt-1 text-zinc-500">
                        Project: {task.projectId?.name || "Unknown"}
                      </CardDescription>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                      task.status === 'DONE' ? 'bg-green-100 text-green-700' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      task.status === 'REVIEW' ? 'bg-orange-100 text-orange-700' :
                      'bg-zinc-100 text-zinc-700'
                    }`}>
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-zinc-600 mb-4 min-h-[40px]">
                    {task.description || <span className="italic text-zinc-400">No description provided.</span>}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                    {task.dueDate && (
                      <div className="flex items-center text-xs text-red-600 font-medium">
                        <Clock className="w-3 h-3 mr-1" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-500">Update Status:</span>
                      <select 
                        className="text-xs p-1.5 border border-zinc-200 rounded focus:ring-indigo-500"
                        value={task.status}
                        onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                        disabled={updatingId === task._id}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Review</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* SECTION: Assigned Projects */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-xl font-bold tracking-tight text-zinc-800">My Projects ({projects.length})</h2>
        </div>
        
        {projects.length === 0 ? (
          <Card className="text-center py-12 border-dashed">
            <CardContent className="pt-6">
              <div className="mx-auto w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                <Folder className="w-6 h-6 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900">No Projects Assigned</h3>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project._id} className="hover:shadow-md transition-shadow group border-zinc-200 bg-zinc-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="group-hover:text-indigo-600 transition-colors">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2 min-h-[40px] mb-2">
                    {project.description || "No description provided."}
                  </CardDescription>
                  {project.metrics && (
                    <div className="w-full mt-4 pt-4 border-t border-zinc-100">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-500">{project.metrics.completed}/{project.metrics.total} Tasks Done</span>
                        <span className="font-medium text-indigo-700">
                          {project.metrics.total > 0 ? Math.round((project.metrics.completed / project.metrics.total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                          style={{ width: `${project.metrics.total > 0 ? (project.metrics.completed / project.metrics.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
