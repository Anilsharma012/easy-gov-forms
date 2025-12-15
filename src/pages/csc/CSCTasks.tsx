import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Search, Clock, CheckCircle2, Play, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Task {
  _id: string;
  title: string;
  description: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  leadId: string;
  status: string;
  priority: string;
  dueDate: string;
  amount: number;
  createdAt: string;
}

const CSCTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/csc/dashboard/tasks", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await fetch(`/api/csc/dashboard/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Task status updated" });
        fetchTasks();
      } else {
        toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update task", variant: "destructive" });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || task.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const taskCounts = {
    pending: tasks.filter(t => t.status === "pending").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Task Assignment</h1>
          <p className="text-muted-foreground">Manage and track your assigned tasks</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <ClipboardList className="w-4 h-4 mr-2" />
          {tasks.length} Tasks
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{taskCounts.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800">In Progress</p>
              <p className="text-2xl font-bold text-blue-900">{taskCounts.in_progress}</p>
            </div>
            <Play className="w-8 h-8 text-blue-600" />
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800">Completed</p>
              <p className="text-2xl font-bold text-green-900">{taskCounts.completed}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({taskCounts.pending})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({taskCounts.in_progress})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({taskCounts.completed})</TabsTrigger>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="text-center py-8">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tasks found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredTasks.map((task) => (
                <Card key={task._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority} Priority
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{task.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {task.userId?.name || "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due: {task.dueDate ? format(new Date(task.dueDate), "dd MMM yyyy") : "N/A"}
                          </span>
                          {task.amount > 0 && (
                            <span className="text-green-600 font-medium">₹{task.amount}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {task.status === "pending" && (
                          <Button 
                            size="sm" 
                            onClick={() => updateTaskStatus(task._id, "in_progress")}
                          >
                            <Play className="w-4 h-4 mr-1" /> Start
                          </Button>
                        )}
                        {task.status === "in_progress" && (
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateTaskStatus(task._id, "completed")}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CSCTasks;
