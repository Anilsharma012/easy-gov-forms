import { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  Image,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  Download,
  Plus,
  CreditCard,
  User,
  GraduationCap,
  Award,
  FolderOpen,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Document {
  _id: string;
  name: string;
  type: string;
  documentNumber?: string;
  fileName: string;
  originalFileName: string;
  fileSize?: string;
  status: "pending" | "verified" | "rejected";
  createdAt: string;
}

const documentCategories = [
  {
    id: "identity",
    title: "Identity Documents",
    icon: CreditCard,
    types: ["aadhaar", "pan", "voter_id", "passport"],
  },
  {
    id: "photo",
    title: "Photo & Signature",
    icon: User,
    types: ["photo", "signature"],
  },
  {
    id: "educational",
    title: "Educational Documents",
    icon: GraduationCap,
    types: ["10th_marksheet", "12th_marksheet", "graduation", "postgraduation", "diploma"],
  },
  {
    id: "certificates",
    title: "Certificates",
    icon: Award,
    types: ["caste", "income", "domicile", "disability", "experience"],
  },
  {
    id: "other",
    title: "Other Documents",
    icon: FolderOpen,
    types: ["other"],
  },
];

const documentTypeLabels: Record<string, string> = {
  aadhaar: "Aadhaar Card",
  pan: "PAN Card",
  voter_id: "Voter ID",
  passport: "Passport",
  photo: "Passport Photo",
  signature: "Signature",
  "10th_marksheet": "10th Marksheet",
  "12th_marksheet": "12th Marksheet",
  graduation: "Graduation Certificate",
  postgraduation: "Post Graduation Certificate",
  diploma: "Diploma Certificate",
  caste: "Caste Certificate",
  income: "Income Certificate",
  domicile: "Domicile Certificate",
  disability: "Disability Certificate",
  experience: "Experience Certificate",
  other: "Other Document",
};

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewingFile, setViewingFile] = useState<{ data: string; name: string } | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const [uploadData, setUploadData] = useState({
    name: "",
    type: "",
    documentNumber: "",
    file: null as File | null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents/my-documents", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setUploadData({ ...uploadData, file });
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.type || !uploadData.name) {
      toast.error("Please fill all required fields");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: uploadData.name,
            type: uploadData.type,
            documentNumber: uploadData.documentNumber,
            fileData: base64,
            fileName: uploadData.file?.name,
            fileSize: `${Math.round((uploadData.file?.size || 0) / 1024)} KB`,
          }),
        });

        if (response.ok) {
          toast.success("Document uploaded successfully!");
          setUploadDialogOpen(false);
          setUploadData({ name: "", type: "", documentNumber: "", file: null });
          fetchDocuments();
        } else {
          const data = await response.json();
          toast.error(data.message || "Failed to upload document");
        }
        setUploading(false);
      };
      reader.readAsDataURL(uploadData.file);
    } catch (error) {
      toast.error("Failed to upload document");
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Document deleted successfully!");
        setDocuments((prev) => prev.filter((doc) => doc._id !== id));
      } else {
        toast.error("Failed to delete document");
      }
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  const handleView = async (doc: Document) => {
    setSelectedDocument(doc);
    setViewDialogOpen(true);
    setLoadingFile(true);

    try {
      const response = await fetch(`/api/documents/view/${doc._id}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const isImage = data.fileName.match(/\.(jpg|jpeg|png|gif)$/i);
        const mimeType = isImage ? `image/${data.fileName.split('.').pop()}` : 'application/pdf';
        setViewingFile({
          data: `data:${mimeType};base64,${data.fileData}`,
          name: data.fileName,
        });
      } else {
        toast.error("Failed to load document");
      }
    } catch (error) {
      toast.error("Failed to load document");
    } finally {
      setLoadingFile(false);
    }
  };

  const getDocumentsByCategory = (types: string[]) => {
    return documents.filter((doc) => types.includes(doc.type));
  };

  const getDocumentIcon = (type: string) => {
    if (type === "photo" || type === "signature") {
      return Image;
    }
    return FileText;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Vault</h1>
          <p className="text-muted-foreground">
            Store and manage all your important documents securely.
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>
                Upload a document to your secure vault.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="docType">Document Type *</Label>
                <Select
                  value={uploadData.type}
                  onValueChange={(value) => setUploadData({ ...uploadData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                    <SelectItem value="pan">PAN Card</SelectItem>
                    <SelectItem value="voter_id">Voter ID</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="photo">Passport Photo</SelectItem>
                    <SelectItem value="signature">Signature</SelectItem>
                    <SelectItem value="10th_marksheet">10th Marksheet</SelectItem>
                    <SelectItem value="12th_marksheet">12th Marksheet</SelectItem>
                    <SelectItem value="graduation">Graduation Certificate</SelectItem>
                    <SelectItem value="postgraduation">Post Graduation Certificate</SelectItem>
                    <SelectItem value="diploma">Diploma Certificate</SelectItem>
                    <SelectItem value="caste">Caste Certificate</SelectItem>
                    <SelectItem value="income">Income Certificate</SelectItem>
                    <SelectItem value="domicile">Domicile Certificate</SelectItem>
                    <SelectItem value="disability">Disability Certificate</SelectItem>
                    <SelectItem value="experience">Experience Certificate</SelectItem>
                    <SelectItem value="other">Other Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="docName">Document Name *</Label>
                <Input
                  id="docName"
                  placeholder="e.g., My Aadhaar Card"
                  value={uploadData.name}
                  onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="docNumber">Document Number (Optional)</Label>
                <Input
                  id="docNumber"
                  placeholder="e.g., XXXX-XXXX-1234"
                  value={uploadData.documentNumber}
                  onChange={(e) => setUploadData({ ...uploadData, documentNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Upload File *</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                >
                  {uploadData.file ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-6 w-6 text-primary" />
                      <span className="text-sm">{uploadData.file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadData({ ...uploadData, file: null });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, JPG, PNG up to 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Upload
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{documents.length}</p>
              <p className="text-sm text-muted-foreground">Total Documents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {documents.filter((d) => d.status === "verified").length}
              </p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {documents.filter((d) => d.status === "pending").length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {documents.filter((d) => d.status === "rejected").length}
              </p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {documentCategories.map((category) => {
          const categoryDocs = getDocumentsByCategory(category.types);
          const Icon = category.icon;

          return (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon className="h-5 w-5 text-primary" />
                  {category.title}
                  <Badge variant="secondary" className="ml-auto">
                    {categoryDocs.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryDocs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No documents uploaded yet
                  </p>
                ) : (
                  categoryDocs.map((doc) => {
                    const DocIcon = getDocumentIcon(doc.type);
                    return (
                      <div
                        key={doc._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
                            <DocIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{doc.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{documentTypeLabels[doc.type] || doc.type}</span>
                              <span>•</span>
                              <span>
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.status === "verified" && (
                            <Badge
                              variant="outline"
                              className="bg-success/10 text-success border-success/20"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {doc.status === "pending" && (
                            <Badge
                              variant="outline"
                              className="bg-warning/10 text-warning border-warning/20"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          {doc.status === "rejected" && (
                            <Badge
                              variant="outline"
                              className="bg-destructive/10 text-destructive border-destructive/20"
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Rejected
                            </Badge>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleView(doc)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(doc._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {loadingFile ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : viewingFile ? (
              <div className="rounded-lg overflow-hidden">
                {viewingFile.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img
                    src={viewingFile.data}
                    alt={selectedDocument?.name}
                    className="w-full h-auto max-h-[60vh] object-contain"
                  />
                ) : (
                  <iframe
                    src={viewingFile.data}
                    className="w-full h-[60vh]"
                    title={selectedDocument?.name}
                  />
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Failed to load document
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
