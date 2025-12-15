import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Loader2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentRequirement {
  type: string;
  name: string;
  description: string;
  status: "not_uploaded" | "pending" | "verified" | "rejected";
  fileName?: string;
  uploadedAt?: string;
  rejectionReason?: string;
}

interface KYCStatus {
  overallStatus: "not_started" | "in_progress" | "pending_review" | "verified" | "rejected";
  documents: DocumentRequirement[];
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

const KYC = () => {
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const response = await fetch("/api/kyc/status", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setKycStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch KYC status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (docType: string, file: File) => {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only PDF, JPG, and PNG files are allowed",
        variant: "destructive",
      });
      return;
    }

    setUploadingDoc(docType);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const response = await fetch("/api/kyc/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            documentType: docType,
            fileData: base64,
            fileName: file.name,
          }),
        });

        if (response.ok) {
          toast({
            title: "Document uploaded",
            description: "Your document has been uploaded successfully",
          });
          fetchKYCStatus();
        } else {
          const data = await response.json();
          toast({
            title: "Upload failed",
            description: data.message || "Failed to upload document",
            variant: "destructive",
          });
        }
        setUploadingDoc(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading",
        variant: "destructive",
      });
      setUploadingDoc(null);
    }
  };

  const handleSubmitKYC = async () => {
    try {
      const response = await fetch("/api/kyc/submit", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "KYC Submitted",
          description: "Your KYC has been submitted for review",
        });
        fetchKYCStatus();
      } else {
        const data = await response.json();
        toast({
          title: "Submission failed",
          description: data.message || "Failed to submit KYC",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Submission failed",
        description: "An error occurred while submitting",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
      case "pending_review":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Started
          </Badge>
        );
    }
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const allDocumentsUploaded = kycStatus?.documents.every(
    (doc) => doc.status !== "not_uploaded"
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">KYC Verification</h1>
          <p className="text-muted-foreground">
            Complete your identity verification to apply for government jobs
          </p>
        </div>
        {kycStatus && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            {getStatusBadge(kycStatus.overallStatus)}
          </div>
        )}
      </div>

      {kycStatus?.overallStatus === "verified" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">KYC Verified</h3>
                <p className="text-sm text-green-700">
                  Your identity has been verified. You can now apply for government jobs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {kycStatus?.overallStatus === "rejected" && kycStatus.rejectionReason && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800">KYC Rejected</h3>
                <p className="text-sm text-red-700">
                  Reason: {kycStatus.rejectionReason}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Please re-upload the required documents and submit again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {kycStatus?.overallStatus === "pending_review" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800">Under Review</h3>
                <p className="text-sm text-yellow-700">
                  Your documents are being reviewed. This usually takes 1-2 business days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>
            Upload all required documents for KYC verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {kycStatus?.documents.map((doc) => (
              <div
                key={doc.type}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg"
              >
                <div className="flex items-start gap-3">
                  {getDocumentStatusIcon(doc.status)}
                  <div>
                    <h4 className="font-medium">{doc.name}</h4>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                    {doc.fileName && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Uploaded: {doc.fileName}
                      </p>
                    )}
                    {doc.status === "rejected" && doc.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1">
                        Rejected: {doc.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status !== "verified" && kycStatus?.overallStatus !== "pending_review" && (
                    <div className="relative">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(doc.type, file);
                          }
                        }}
                        disabled={uploadingDoc === doc.type}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={uploadingDoc === doc.type}
                      >
                        {uploadingDoc === doc.type ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : doc.status === "not_uploaded" ? (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Replace
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  {doc.status === "verified" && (
                    <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  )}
                  {doc.status === "pending" && (
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {kycStatus?.overallStatus !== "verified" && 
           kycStatus?.overallStatus !== "pending_review" && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {allDocumentsUploaded
                      ? "All documents uploaded. Submit for review."
                      : "Upload all documents before submitting for review."}
                  </p>
                </div>
                <Button
                  onClick={handleSubmitKYC}
                  disabled={!allDocumentsUploaded}
                  className="bg-primary"
                >
                  Submit for Verification
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              Upload clear, readable images or PDFs of your documents
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              Ensure all corners of the document are visible
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              File size should be less than 5MB per document
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              Supported formats: PDF, JPG, JPEG, PNG
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              Verification usually takes 1-2 business days
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYC;
