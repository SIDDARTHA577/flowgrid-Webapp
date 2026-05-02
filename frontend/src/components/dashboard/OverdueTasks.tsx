import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Task {
  _id: string;
  title: string;
  dueDate: string;
  assignedTo?: { name: string };
  projectId?: { name: string };
}

interface OverdueTasksProps {
  tasks: Task[];
}

export function OverdueTasks({ tasks }: OverdueTasksProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-red-600">Overdue Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <p className="text-sm text-zinc-500">No overdue tasks.</p>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-zinc-500">
                    Project: {task.projectId?.name || 'N/A'} | Assigned: {task.assignedTo?.name || 'Unassigned'}
                  </p>
                </div>
                <div className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded">
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
