import { useState } from "react";
import { Save, History, FileText, Shield, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const policies = {
  terms: {
    title: "Terms & Conditions",
    lastUpdated: "2024-01-15",
    version: "1.2",
    content: `Terms and Conditions for Easy Gov Forms

1. Introduction
Welcome to Easy Gov Forms. By using our platform, you agree to these terms.

2. Services
We provide AI-assisted government form filling services...

3. User Responsibilities
Users must provide accurate information...

4. Payment Terms
All payments are non-refundable except as specified in our refund policy...

5. Privacy
Your data is handled according to our Privacy Policy...`,
  },
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "2024-01-15",
    version: "1.1",
    content: `Privacy Policy for Easy Gov Forms

1. Data Collection
We collect personal information including name, email, mobile...

2. Data Usage
Your data is used to provide form filling services...

3. Data Security
All data is encrypted and stored securely...

4. Third Party Sharing
We do not share your data with third parties except...

5. Your Rights
You can request data deletion at any time...`,
  },
  refund: {
    title: "Refund Policy",
    lastUpdated: "2024-01-10",
    version: "1.0",
    content: `Refund Policy for Easy Gov Forms

1. Eligibility
Refunds are available within 7 days of purchase if...

2. Process
To request a refund, contact support...

3. Timeline
Refunds are processed within 5-7 business days...

4. Exceptions
No refunds for packages with used credits...`,
  },
};

export default function AdminLegal() {
  const [activePolicy, setActivePolicy] = useState<keyof typeof policies>("terms");
  const [content, setContent] = useState(policies[activePolicy].content);

  const handleSave = () => {
    toast.success(`${policies[activePolicy].title} updated successfully!`);
  };

  const handlePolicyChange = (policy: string) => {
    setActivePolicy(policy as keyof typeof policies);
    setContent(policies[policy as keyof typeof policies].content);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Legal & Policies</h1>
        <p className="text-muted-foreground">
          Manage terms, privacy policy, and refund policy.
        </p>
      </div>

      <Tabs value={activePolicy} onValueChange={handlePolicyChange}>
        <TabsList>
          <TabsTrigger value="terms" className="gap-2">
            <FileText className="h-4 w-4" />
            Terms & Conditions
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            Privacy Policy
          </TabsTrigger>
          <TabsTrigger value="refund" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refund Policy
          </TabsTrigger>
        </TabsList>

        {Object.entries(policies).map(([key, policy]) => (
          <TabsContent key={key} value={key} className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <CardTitle>{policy.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">Version {policy.version}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Last updated:{" "}
                        {new Date(policy.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <History className="h-4 w-4 mr-2" />
                      View History
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={key === activePolicy ? content : policy.content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                  placeholder="Enter policy content..."
                />
                <p className="text-sm text-muted-foreground mt-4">
                  Note: Changes will be reflected on the website immediately after
                  saving. Make sure to review carefully before publishing.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}