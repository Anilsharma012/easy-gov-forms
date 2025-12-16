import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Users,
  Building2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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

interface CSCPackage {
  _id: string;
  name: string;
  leads: number;
  price: number;
  originalPrice: number;
  validity: number;
  features: string[];
  isActive: boolean;
}

export default function AdminPackages() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cscPackages, setCscPackages] = useState<CSCPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CSCPackage | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    leads: "",
    price: "",
    originalPrice: "",
    validity: "30",
    features: "",
  });

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/csc-centers/lead-packages/all", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCscPackages(data.packages || []);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      leads: "",
      price: "",
      originalPrice: "",
      validity: "30",
      features: "",
    });
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.leads || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/csc-centers/lead-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          leads: parseInt(formData.leads),
          price: parseInt(formData.price),
          originalPrice: parseInt(formData.originalPrice) || parseInt(formData.price),
          validity: parseInt(formData.validity) || 30,
          features: formData.features.split("\n").filter((f) => f.trim()),
        }),
      });

      if (response.ok) {
        toast.success("Package created successfully!");
        setCreateDialogOpen(false);
        resetForm();
        fetchPackages();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to create package");
      }
    } catch (error) {
      toast.error("Failed to create package");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedPackage) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/csc-centers/lead-packages/${selectedPackage._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          leads: parseInt(formData.leads),
          price: parseInt(formData.price),
          originalPrice: parseInt(formData.originalPrice) || parseInt(formData.price),
          validity: parseInt(formData.validity) || 30,
          features: formData.features.split("\n").filter((f) => f.trim()),
        }),
      });

      if (response.ok) {
        toast.success("Package updated successfully!");
        setEditDialogOpen(false);
        setSelectedPackage(null);
        resetForm();
        fetchPackages();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update package");
      }
    } catch (error) {
      toast.error("Failed to update package");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (pkg: CSCPackage) => {
    try {
      const response = await fetch(`/api/csc-centers/lead-packages/${pkg._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !pkg.isActive }),
      });

      if (response.ok) {
        toast.success(`Package "${pkg.name}" ${!pkg.isActive ? "activated" : "deactivated"}`);
        fetchPackages();
      }
    } catch (error) {
      toast.error("Failed to update package");
    }
  };

  const handleDelete = async (pkg: CSCPackage) => {
    if (!confirm(`Are you sure you want to delete "${pkg.name}"?`)) return;

    try {
      const response = await fetch(`/api/csc-centers/lead-packages/${pkg._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Package deleted successfully!");
        fetchPackages();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete package");
      }
    } catch (error) {
      toast.error("Failed to delete package");
    }
  };

  const openEditDialog = (pkg: CSCPackage) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      leads: pkg.leads.toString(),
      price: pkg.price.toString(),
      originalPrice: pkg.originalPrice.toString(),
      validity: pkg.validity.toString(),
      features: pkg.features?.join("\n") || "",
    });
    setEditDialogOpen(true);
  };

  const handleUserToggle = (name: string) => {
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
              Add CSC Package
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New CSC Package</DialogTitle>
              <DialogDescription>Create a new lead package for CSC centers.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Package Name *</Label>
                <Input
                  placeholder="e.g., Starter Pack"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Leads Count *</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={formData.leads}
                    onChange={(e) => setFormData({ ...formData, leads: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price (Rs) *</Label>
                  <Input
                    type="number"
                    placeholder="999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Original Price (Rs)</Label>
                  <Input
                    type="number"
                    placeholder="1500"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Validity (Days)</Label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={formData.validity}
                    onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Features (one per line)</Label>
                <Textarea
                  placeholder="Priority support&#10;Dedicated manager&#10;Fast processing"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Package
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="csc">
        <TabsList>
          <TabsTrigger value="csc" className="gap-2">
            <Building2 className="h-4 w-4" />
            CSC Packages
          </TabsTrigger>
          <TabsTrigger value="user" className="gap-2">
            <Users className="h-4 w-4" />
            User Packages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="csc" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cscPackages.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No CSC packages created yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create packages for CSC centers to purchase leads
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Package
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {cscPackages.map((pkg) => (
                <Card key={pkg._id} className={pkg.isActive ? "" : "opacity-60"}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      {!pkg.isActive && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-primary">Rs {pkg.price}</p>
                      {pkg.originalPrice > pkg.price && (
                        <p className="text-sm text-muted-foreground line-through">
                          Rs {pkg.originalPrice}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{pkg.leads} Leads</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Valid for {pkg.validity} days
                    </div>
                    {pkg.features && pkg.features.length > 0 && (
                      <ul className="text-sm space-y-1">
                        {pkg.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="text-muted-foreground">- {f}</li>
                        ))}
                      </ul>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm">Active</span>
                      <Switch
                        checked={pkg.isActive}
                        onCheckedChange={() => handleToggle(pkg)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(pkg)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive"
                        onClick={() => handleDelete(pkg)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

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
                    <p className="text-3xl font-bold text-primary">Rs {pkg.price}</p>
                    <p className="text-sm text-muted-foreground line-through">
                      Rs {pkg.originalPrice}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span>{pkg.forms} Forms</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm">Active</span>
                    <Switch defaultChecked onCheckedChange={() => handleUserToggle(pkg.name)} />
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit CSC Package</DialogTitle>
            <DialogDescription>Update the package details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Package Name *</Label>
              <Input
                placeholder="e.g., Starter Pack"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Leads Count *</Label>
                <Input
                  type="number"
                  placeholder="10"
                  value={formData.leads}
                  onChange={(e) => setFormData({ ...formData, leads: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Price (Rs) *</Label>
                <Input
                  type="number"
                  placeholder="999"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Original Price (Rs)</Label>
                <Input
                  type="number"
                  placeholder="1500"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Validity (Days)</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={formData.validity}
                  onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea
                placeholder="Priority support&#10;Dedicated manager&#10;Fast processing"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setEditDialogOpen(false); setSelectedPackage(null); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
