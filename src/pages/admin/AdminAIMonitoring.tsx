import { Bot, CheckCircle, AlertTriangle, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const aiLogs = [
  {
    id: "1",
    formType: "SSC CGL 2024",
    user: "Rahul Sharma",
    status: "success",
    accuracy: 98,
    timestamp: "2024-02-15T10:30:00",
    fields: 45,
    errors: 0,
  },
  {
    id: "2",
    formType: "IBPS PO 2024",
    user: "Priya Patel",
    status: "success",
    accuracy: 95,
    timestamp: "2024-02-15T09:45:00",
    fields: 38,
    errors: 2,
  },
  {
    id: "3",
    formType: "Railway NTPC",
    user: "Amit Kumar",
    status: "warning",
    accuracy: 87,
    timestamp: "2024-02-15T09:20:00",
    fields: 42,
    errors: 5,
  },
  {
    id: "4",
    formType: "UPSC Civil Services",
    user: "Sneha Reddy",
    status: "error",
    accuracy: 72,
    timestamp: "2024-02-15T08:50:00",
    fields: 56,
    errors: 12,
  },
];

const automationRules = [
  {
    name: "Last Date Reminder",
    description: "Send reminder 3 days before deadline",
    enabled: true,
    triggers: 45,
  },
  {
    name: "Application Status Update",
    description: "Notify when application status changes",
    enabled: true,
    triggers: 120,
  },
  {
    name: "Document Verification Alert",
    description: "Alert when documents are verified/rejected",
    enabled: true,
    triggers: 28,
  },
  {
    name: "Package Expiry Warning",
    description: "Warn 7 days before package expires",
    enabled: false,
    triggers: 0,
  },
];

export default function AdminAIMonitoring() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI & Automation Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor AI form filling and automation rules.
        </p>
      </div>

      {/* AI Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">342</p>
              <p className="text-sm text-muted-foreground">Forms Filled Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">94.5%</p>
              <p className="text-sm text-muted-foreground">Avg Accuracy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Errors Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold">2.3s</p>
              <p className="text-sm text-muted-foreground">Avg Fill Time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Recent AI Form Filling Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Form Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Fields</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aiLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.formType}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>
                      {log.fields} fields
                      {log.errors > 0 && (
                        <span className="text-destructive ml-1">
                          ({log.errors} errors)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={log.accuracy} className="w-16 h-2" />
                        <span className="text-sm">{log.accuracy}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          log.status === "success"
                            ? "bg-success/10 text-success"
                            : log.status === "warning"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                        }
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Automation Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automationRules.map((rule) => (
              <div
                key={rule.name}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{rule.name}</p>
                    <Badge
                      variant="outline"
                      className={
                        rule.enabled
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {rule.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {rule.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{rule.triggers}</p>
                  <p className="text-xs text-muted-foreground">triggers today</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}