"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, Trash2, ChevronDown, ChevronRight, Layers } from "lucide-react";
import api from "@/lib/axios";
import React, { useState } from "react";
import { ProjectTasksDetails } from "./ProjectTasksDetails";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Project {
  _id: string;
  name: string;
  description?: string;
  members: User[];
  createdAt: string;
  metrics?: { total: number; completed: number };
}

interface ProjectListAdminProps {
  projects: Project[];
  onProjectDeleted: () => void;
}

export function ProjectListAdmin({ projects, onProjectDeleted }: ProjectListAdminProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const toggleExpand = (projectId: string) => {
    if (expandedProjectId === projectId) {
      setExpandedProjectId(null);
    } else {
      setExpandedProjectId(projectId);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    
    setDeletingId(id);
    try {
      await api.delete(`projects/${id}`);
      onProjectDeleted();
    } catch (error) {
      console.error("Failed to delete project", error);
      alert("Failed to delete project.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="col-span-full border-zinc-200 shadow-sm">
      <CardHeader className="bg-white border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <CardTitle className="text-zinc-900">Manage Projects</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 border-b">
              <tr>
                <th className="w-10 px-4 py-4"></th>
                <th className="px-6 py-4 font-semibold">Project Name</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Members</th>
                <th className="px-6 py-4 font-semibold">Created Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Progress</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No projects found. Create one above to get started.
                  </td>
                </tr>
              ) : (
                projects.map((project, projectIndex) => (
                  <React.Fragment key={`${project._id}-${projectIndex}`}>
                    <tr 
                      className={`bg-white hover:bg-zinc-50 transition-colors cursor-pointer ${expandedProjectId === project._id ? 'bg-indigo-50/30' : ''}`}
                      onClick={() => toggleExpand(project._id)}
                    >
                      <td className="px-4 py-4 text-zinc-400">
                        {expandedProjectId === project._id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900">{project.name}</td>
                    <td className="px-6 py-4 text-zinc-600 max-w-xs truncate" title={project.description}>
                      {project.description || <span className="text-zinc-400 italic">No description</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2 overflow-hidden">
                        {project.members.slice(0, 3).map((member, i) => (
                          <div 
                            key={`${member._id}-${i}`} 
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs"
                            title={member.name}
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {project.members.length > 3 && (
                          <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-xs">
                            +{project.members.length - 3}
                          </div>
                        )}
                        {project.members.length === 0 && (
                          <span className="text-zinc-400 italic">Empty</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 align-top">
                      {project.metrics ? (
                        <div className="w-full max-w-[150px]">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-500">{project.metrics.completed}/{project.metrics.total} Tasks</span>
                            <span className="font-medium text-zinc-700">
                              {project.metrics.total > 0 ? Math.round((project.metrics.completed / project.metrics.total) * 100) : 0}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                              style={{ width: `${project.metrics.total > 0 ? (project.metrics.completed / project.metrics.total) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 italic">No tasks</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right align-top">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 z-10 relative"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project._id);
                        }}
                        disabled={deletingId === project._id}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deletingId === project._id ? "Deleting..." : "Delete"}
                      </Button>
                    </td>
                  </tr>
                  {expandedProjectId === project._id && (
                    <tr>
                      <td colSpan={7} className="p-0 border-b border-zinc-200">
                        <ProjectTasksDetails projectId={project._id} />
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
