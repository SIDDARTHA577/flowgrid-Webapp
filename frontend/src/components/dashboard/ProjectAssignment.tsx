"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Project {
  _id: string;
  name: string;
  members: User[];
}

interface ProjectAssignmentProps {
  projects: Project[];
  users: User[];
  onAssigned: () => void;
}

export function ProjectAssignment({ projects, users, onAssigned }: ProjectAssignmentProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAssign = async () => {
    if (!selectedProjectId || !selectedUserId) return;
    setLoading(true);
    setError("");
    try {
      await api.post(`projects/${selectedProjectId}/invite`, { userId: selectedUserId });
      onAssigned();
      setSelectedUserId("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to assign user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Assign Users to Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Select Project</label>
            <select 
              className="w-full p-2 border rounded-md text-sm"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">-- Choose Project --</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Select User</label>
            <select 
              className="w-full p-2 border rounded-md text-sm"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">-- Choose User --</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          <Button 
            onClick={handleAssign} 
            disabled={!selectedProjectId || !selectedUserId || loading}
            className="w-full md:w-auto"
          >
            {loading ? "Assigning..." : "Assign User"}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}
