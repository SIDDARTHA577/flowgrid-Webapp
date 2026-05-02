"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import api from "@/lib/axios";

interface CreateProjectProps {
  onCreated: () => void;
}

export function CreateProject({ onCreated }: CreateProjectProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tasks, setTasks] = useState<{ title: string; description: string }[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddTask = () => {
    setTasks([...tasks, { title: `Task ${tasks.length + 1}`, description: "" }]);
  };

  const handleRemoveTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  const handleTaskChange = (index: number, field: 'title' | 'description', value: string) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      await api.post("/projects", { 
        name, 
        description,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        tasks: tasks.filter(t => t.title.trim() !== '')
      });
      
      setSuccess("Project and timeline created successfully!");
      setName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setTasks([]);
      onCreated();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const error = err as any;
      setError(error.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-sm border-zinc-200">
      <CardHeader className="bg-zinc-50 border-b border-zinc-100 pb-4">
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>Set up a project timeline and initial tasks.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name *</label>
              <Input 
                placeholder="e.g. Website Redesign" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input 
                placeholder="Brief description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date (Deadline)</label>
              <Input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-zinc-900">Initial Tasks</label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddTask} disabled={loading}>
                <Plus className="w-4 h-4 mr-1" /> Add Task
              </Button>
            </div>
            
            {tasks.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">No initial tasks. You can add them later.</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div key={index} className="flex gap-2 items-start bg-zinc-50 p-3 rounded-md border border-zinc-200">
                    <div className="flex-1 space-y-2">
                      <Input 
                        placeholder="Task Title (e.g. Task 1)" 
                        value={task.title}
                        onChange={(e) => handleTaskChange(index, 'title', e.target.value)}
                        disabled={loading}
                        className="h-8"
                        required
                      />
                      <Input 
                        placeholder="Short description..." 
                        value={task.description}
                        onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                        disabled={loading}
                        className="h-8 text-xs"
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveTask(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={!name || loading} className="w-full">
            {loading ? "Creating Project..." : "Create Project & Timeline"}
          </Button>

          {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
          {success && <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">{success}</div>}
        </form>
      </CardContent>
    </Card>
  );
}
