import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Users,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { mockPackages } from "@/data/mockData";
import { toast } from "sonner";

const cscPackages = [
  { id: "1", name: "10 Leads", leads: 10, price: 500, active: true },
  { id: "2", name: "20 Leads", leads: 20, price: 900, active: true },
  { id: "3", name: "50 Leads", leads: 50, price: 2000, active: true },
  { id: "4", name: "100 Leads", leads: 100, price: 3500, active: true },
  { id: "5", name: "200 Leads", leads: 200, price: 6000, active: false },
];

export default function AdminPackages() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreate = () => {
    toast.success("Package created successfully!");
    setCreateDialogOpen(false);
  };

  const handleToggle = (name: string) => {
    toast.success(`Package "${name}" status updated`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Package Management</h1>
          <p className="text-muted-foreground">
            Manage user and CSC center packages.
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Package</DialogTitle>
              <DialogDescription>Create a new package for users or CSC centers.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input placeholder="e.g., Starter" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Forms/Leads Count</Label>
                  <Input type="number" placeholder="10" />
                </div>
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input type="number" placeholder="999" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Original Price (₹)</Label>
                <Input type="number" placeholder="1500" />
              </div>
              <div className="space-y-2">
                <Label>Validity (Days)</Label>
                <Input type="number" placeholder="30" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create Package</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="user">
        <TabsList>
          <TabsTrigger value="user" className="gap-2">
            <Users className="h-4 w-4" />
            User Packages
          </TabsTrigger>
          <TabsTrigger value="csc" className="gap-2">
            <Building2 className="h-4 w-4" />
            CSC Packages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {mockPackages.map((pkg) => (
              <Card key={pkg.id} className={pkg.popular ? "border-primary" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    {pkg.popular && <Badge>Popular</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-primary">₹{pkg.price}</p>
                    <p className="text-sm text-muted-foreground line-through">
                      ₹{pkg.originalPrice}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{pkg.forms} Forms</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm">Active</span>
                    <Switch defaultChecked onCheckedChange={() => handleToggle(pkg.name)} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="csc" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {cscPackages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-primary">₹{pkg.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{pkg.leads} Leads</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm">Active</span>
                    <Switch
                      defaultChecked={pkg.active}
                      onCheckedChange={() => handleToggle(pkg.name)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}