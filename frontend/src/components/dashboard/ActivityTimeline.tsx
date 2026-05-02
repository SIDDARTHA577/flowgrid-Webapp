import { Activity as ActivityIcon, Trash2 } from "lucide-react";
import api from "@/lib/axios";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Activity {
  _id: string;
  action: string;
  performedBy?: { name: string };
  projectId?: { name: string };
  createdAt: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  onClearHistory?: () => void;
}

export function ActivityTimeline({ activities, onClearHistory }: ActivityTimelineProps) {
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    if (!window.confirm("Are you sure you want to clear all activity history? This cannot be undone.")) return;
    setClearing(true);
    try {
      await api.delete("dashboard/activity");
      if (onClearHistory) onClearHistory();
    } catch (err) {
      console.error(err);
      alert("Failed to clear activity history");
    } finally {
      setClearing(false);
    }
  };

  const getBadgeColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('DELETE')) return 'text-red-700 bg-red-50 ring-1 ring-red-200';
    if (act.includes('CREATE')) return 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200';
    if (act.includes('UPDATE') || act.includes('STATUS')) return 'text-sky-700 bg-sky-50 ring-1 ring-sky-200';
    return 'text-indigo-700 bg-indigo-50 ring-1 ring-indigo-200';
  };

  const getDotColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('DELETE')) return 'border-red-500 shadow-red-200';
    if (act.includes('CREATE')) return 'border-emerald-500 shadow-emerald-200';
    if (act.includes('UPDATE') || act.includes('STATUS')) return 'border-sky-500 shadow-sky-200';
    return 'border-indigo-500 shadow-indigo-200';
  };

  return (
    <div className="h-full bg-white rounded-xl flex flex-col relative overflow-hidden group/timeline">
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-zinc-900 tracking-tight">Recent Activity</h3>
        </div>
        
        {activities.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClear} 
            disabled={clearing}
            className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors opacity-0 group-hover/timeline:opacity-100 focus:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            {clearing ? "Clearing..." : "Clear"}
          </Button>
        )}
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="relative border-l-2 border-zinc-100 ml-3 space-y-8">
          {activities.length === 0 ? (
            <div className="text-sm text-zinc-500 ml-6 italic py-4 flex flex-col items-center justify-center h-full space-y-3 opacity-70">
              <ActivityIcon className="w-8 h-8 text-zinc-300" />
              <p>No recent activities.</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity._id} className="relative ml-6 group animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Timeline Dot */}
                <span className={`absolute flex items-center justify-center w-3 h-3 bg-white rounded-full -left-[1.65rem] ring-4 ring-white border-2 shadow-sm transition-all duration-300 group-hover:scale-125 ${getDotColor(activity.action)}`}></span>
                
                {/* Content */}
                <div className="flex flex-col gap-1.5 bg-zinc-50/50 p-3 rounded-lg border border-zinc-100/50 transition-colors group-hover:bg-zinc-50">
                  <div className="flex items-center justify-between gap-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getBadgeColor(activity.action)}`}>
                      {activity.action}
                    </span>
                    <time className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                      {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                  
                  <div className="mt-1 text-sm text-zinc-600 leading-snug">
                    <span className="font-semibold text-zinc-900">
                      {activity.performedBy?.name || 'System'}
                    </span>
                    <span className="text-zinc-500 mx-1">performed this action</span>
                    {activity.projectId && (
                      <>
                        in <span className="font-medium text-zinc-800">{activity.projectId.name}</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 font-medium">
                     {new Date(activity.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
