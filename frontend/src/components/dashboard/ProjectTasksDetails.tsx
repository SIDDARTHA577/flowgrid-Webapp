import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { CheckCircle2, Clock, AlertCircle, Circle, User, Calendar, MoreHorizontal } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  assignedTo?: { _id: string; name: string; email: string };
  dueDate?: string;
}

interface ProjectTasksDetailsProps {
  projectId: string;
}

export function ProjectTasksDetails({ projectId }: ProjectTasksDetailsProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get(`tasks?projectId=${projectId}`);
        setTasks(data.tasks);
      } catch (error) {
        console.error("Failed to fetch tasks for project", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DONE": 
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Done</span>
          </div>
        );
      case "IN_PROGRESS": 
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">In Progress</span>
          </div>
        );
      case "REVIEW": 
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200/60 shadow-sm">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">In Review</span>
          </div>
        );
      default: 
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200/60 shadow-sm">
            <Circle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">To Do</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center bg-zinc-50/50 rounded-b-xl border-t border-zinc-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
        <p className="text-sm font-medium text-zinc-500">Loading project tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-10 text-center bg-zinc-50/50 rounded-b-xl border-t border-zinc-100">
        <p className="text-sm font-medium text-zinc-500">No tasks have been created for this project yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50/80 border-t border-zinc-200 p-0 rounded-b-xl shadow-inner overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200 bg-white/50 backdrop-blur-sm flex items-center justify-between">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Project Tasks <span className="ml-2 bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-full">{tasks.length}</span></h4>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-100/50 text-zinc-500 text-[11px] uppercase tracking-wider font-semibold border-b border-zinc-200">
            <tr>
              <th className="px-6 py-3">Task Details</th>
              <th className="px-6 py-3 w-40">Status</th>
              <th className="px-6 py-3 w-48">Assignee</th>
              <th className="px-6 py-3 w-40">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/70 bg-white/40 backdrop-blur-sm">
            {tasks.map((task) => (
              <tr key={task._id} className="hover:bg-white/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-zinc-900 group-hover:text-indigo-700 transition-colors">{task.title}</span>
                    {task.description && (
                      <span className="text-xs text-zinc-500 truncate max-w-[300px] block" title={task.description}>
                        {task.description}
                      </span>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  {getStatusBadge(task.status)}
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {task.assignedTo ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold shadow-sm border border-white">
                          {task.assignedTo.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-900">{task.assignedTo.name}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center border border-dashed border-zinc-300">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-sm text-zinc-400 italic font-medium">Unassigned</span>
                      </>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  {task.dueDate ? (
                    <div className="flex items-center gap-2 text-zinc-600 bg-zinc-100/50 px-3 py-1.5 rounded-lg w-fit border border-zinc-200/50">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-xs font-medium">
                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400 italic px-3 py-1.5 block">No date</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
