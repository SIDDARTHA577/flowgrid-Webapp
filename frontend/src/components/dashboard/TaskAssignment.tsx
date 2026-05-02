"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Project {
  _id: string;
  name: string;
}

interface Task {
  _id: string;
  title: string;
  description?: string;
  assignedTo?: string | null;
}

interface TaskAssignmentProps {
  projects: Project[];
  users: User[];
  onAssigned: () => void;
}

export function TaskAssignment({ projects, users, onAssigned }: TaskAssignmentProps) {
  const [projectId, setProjectId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  
  // Multi-select state
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [createNew, setCreateNew] = useState(false);
  
  // New task state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch tasks when project changes
  useEffect(() => {
    if (!projectId) {
      setProjectTasks([]);
      setSelectedTaskIds([]);
      setCreateNew(false);
      return;
    }

    const fetchTasks = async () => {
      setLoadingTasks(true);
      try {
        const { data } = await api.get(`/tasks?projectId=${projectId}`);
        // Filter to show only unassigned tasks
        const unassigned = data.tasks.filter((t: any) => !t.assignedTo);
        setProjectTasks(unassigned);
        setSelectedTaskIds([]);
        setCreateNew(unassigned.length === 0);
      } catch (err) {
        console.error("Failed to fetch project tasks", err);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !assignedTo) return;
    
    if (selectedTaskIds.length === 0 && !createNew) {
      setError("Please select at least one task or choose to create a new one.");
      return;
    }

    if (createNew && !title) {
      setError("Please provide a title for the new task.");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const promises = [];

      // Assign selected existing tasks
      for (const id of selectedTaskIds) {
        promises.push(
          api.put(`/tasks/${id}`, {
            assignedTo,
            // Only update dueDate if one was provided in the form
            ...(dueDate && { dueDate }),
          })
        );
      }

      // Create brand new task if checked
      if (createNew) {
        promises.push(
          api.post("/tasks", {
            title,
            description,
            projectId,
            assignedTo,
            dueDate: dueDate || undefined,
            priority: "MEDIUM"
          })
        );
      }
      
      await Promise.all(promises);

      setSuccess("Tasks assigned successfully!");
      setTitle("");
      setDescription("");
      setDueDate("");
      setSelectedTaskIds([]);
      setCreateNew(false);
      
      // Remove assigned tasks from the local unassigned list
      setProjectTasks(prev => prev.filter(t => !selectedTaskIds.includes(t._id)));
      
      onAssigned();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to assign tasks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-sm border-zinc-200">
      <CardHeader className="bg-zinc-50 border-b border-zinc-100 pb-4">
        <CardTitle>Assign Tasks</CardTitle>
        <CardDescription>Assign unassigned project tasks directly to users, or create new ones.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleAssign} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Project *</label>
              <select 
                className="w-full p-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
              >
                <option value="">-- Choose Project --</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign To User *</label>
              <select 
                className="w-full p-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                required
              >
                <option value="">-- Choose User --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
          </div>

          {projectId && (
            <div className="space-y-4 pt-2 border-t border-zinc-100">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Existing Tasks</label>
                {loadingTasks ? (
                  <p className="text-xs text-zinc-500">Loading unassigned tasks...</p>
                ) : projectTasks.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-zinc-200 rounded-md p-3 bg-zinc-50/50">
                    {projectTasks.map((t) => (
                      <div key={t._id} className="flex items-start space-x-2">
                        <input 
                          type="checkbox" 
                          id={`task-${t._id}`}
                          checked={selectedTaskIds.includes(t._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTaskIds([...selectedTaskIds, t._id]);
                            } else {
                              setSelectedTaskIds(selectedTaskIds.filter(id => id !== t._id));
                            }
                          }}
                          className="mt-1 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <label htmlFor={`task-${t._id}`} className="text-sm text-zinc-700 cursor-pointer">
                          <span className="font-semibold">{t.title}</span> 
                          {t.description && <span className="text-zinc-500"> - {t.description}</span>}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500 italic p-2 bg-zinc-50 rounded border border-zinc-100">No unassigned tasks remaining for this project.</p>
                )}
              </div>
              
              <div className="pt-2">
                <label className="text-sm font-medium flex items-center space-x-2 cursor-pointer bg-indigo-50/50 p-2 rounded border border-indigo-100 w-fit">
                  <input 
                    type="checkbox" 
                    checked={createNew}
                    onChange={(e) => setCreateNew(e.target.checked)}
                    className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-indigo-900 font-medium">+ Create a New Custom Task</span>
                </label>
              </div>
            </div>
          )}

          {createNew && (
            <div className="space-y-4 p-4 border border-indigo-100 rounded-lg bg-indigo-50/30 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Task Title *</label>
                  <Input 
                    placeholder="e.g. Design Homepage" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required={createNew}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date (Optional)</label>
                  <Input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Short Description (Optional)</label>
                <textarea 
                  className="w-full flex min-h-[60px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                  placeholder="Provide task details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={!projectId || !assignedTo || (selectedTaskIds.length === 0 && !createNew) || loading}
            className="w-full h-11"
          >
            {loading ? "Assigning..." : `Assign ${selectedTaskIds.length + (createNew ? 1 : 0)} Task(s)`}
          </Button>
          
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-100">{error}</div>}
          {success && <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm border border-green-100">{success}</div>}
        </form>
      </CardContent>
    </Card>
  );
}
