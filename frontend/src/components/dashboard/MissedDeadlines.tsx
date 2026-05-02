import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, Clock } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  dueDate: string;
  assignedTo?: { name: string; email: string };
  projectId?: { name: string };
  status: string;
}

interface MissedDeadlinesProps {
  tasks: Task[];
}

export function MissedDeadlines({ tasks }: MissedDeadlinesProps) {
  return (
    <Card className="h-full border-red-100 shadow-sm">
      <CardHeader className="bg-red-50/50 border-b border-red-100 pb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <CardTitle className="text-red-700">Missed Deadlines & Updates</CardTitle>
        </div>
        <p className="text-xs text-red-500 mt-1">Users failing to update their assigned tasks on time.</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-zinc-100">
          {tasks.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500 flex flex-col items-center">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              All projects and tasks are up to date!
            </div>
          ) : (
            tasks.map((task) => {
              const overdueDays = Math.floor((new Date().getTime() - new Date(task.dueDate).getTime()) / (1000 * 3600 * 24));
              
              return (
                <div key={task._id} className="p-4 hover:bg-zinc-50 transition-colors flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 border border-red-200">
                    <span className="text-red-700 font-bold text-sm">
                      {task.assignedTo?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-zinc-900 truncate">
                      {task.assignedTo?.name || 'Unassigned User'}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">
                      Failed to update <span className="font-medium text-zinc-700">"{task.title}"</span> in <span className="font-medium text-indigo-600">{task.projectId?.name || 'Unknown Project'}</span>
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                      {overdueDays} {overdueDays === 1 ? 'day' : 'days'} late
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1 font-medium uppercase tracking-wider">
                      Status: {task.status}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
