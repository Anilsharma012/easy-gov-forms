import { Router, Response } from "express";
import { verifyToken, AuthRequest } from "../middleware/auth";
import { Application } from "../models/Application";
import { Job } from "../models/Job";
import { UserPackage } from "../models/UserPackage";
import { User } from "../models/User";
import { UserDocument } from "../models/UserDocument";

// ✅ ADD THIS IMPORT (Lead auto create)
import { Lead } from "../models/Lead";

const REQUIRED_DOCUMENT_TYPES = ["aadhaar", "photo", "signature", "10th_marksheet"];

const router = Router();

router.get("/my-applications", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const applications = await Application.find({ userId })
      .populate("jobId")
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch applications" });
  }
});

router.post("/apply", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { jobId, formData } = req.body;

    // ✅ Check active package
    const activePackage = await UserPackage.findOne({
      userId,
      status: "active",
      remainingForms: { $gt: 0 },
      expiresAt: { $gt: new Date() },
    });

    if (!activePackage) {
      return res.status(400).json({
        message: "No active package with remaining forms. Please purchase a package to apply.",
        needsPackage: true,
      });
    }

    // ✅ Check required docs
    const userDocuments = await UserDocument.find({ userId });
    const uploadedTypes = userDocuments.map((doc) => doc.type);

    const missingDocuments = REQUIRED_DOCUMENT_TYPES.filter((type) => !uploadedTypes.includes(type));

    if (missingDocuments.length > 0) {
      return res.status(400).json({
        message: "Please upload all required documents before applying",
        needsDocuments: true,
        missingDocuments,
        requiredDocuments: REQUIRED_DOCUMENT_TYPES,
      });
    }

    // ✅ Check job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // ✅ Prevent duplicate apply
    const existingApplication = await Application.findOne({ userId, jobId });
    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    const applicationId = `EGF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // ✅ Create application
    const application = new Application({
      userId,
      jobId,
      formName: job.title,
      type: "job",
      status: "pending",
      applicationId,
      formData,
      packageUsed: activePackage.packageName,
    });

    await application.save();

    // ✅ Reduce package remaining forms
    activePackage.usedForms += 1;
    activePackage.remainingForms -= 1;
    await activePackage.save();

    // ✅ Update user application count
    await User.findByIdAndUpdate(userId, {
      $inc: { totalApplications: 1 },
    });

    // ✅ ✅ ✅ AUTO CREATE LEAD FOR ADMIN PANEL
    // NOTE: Tumhare User model me field `phone` hai (mobile nahi).
    // Isliye pehle wala code Lead creation fail kar raha tha (mobile empty -> mongoose required validation fail),
    // and result: Admin > E-Gov Leads blank.
    try {
      const user = await User.findById(userId).select("name phone email");

      await Lead.create({
        userId,
        name: user?.name || "User",
        mobile: user?.phone || "NA", // Lead schema me `mobile` required hai
        email: user?.email || "",
        formName: job.title,
        type: "job",
        status: "new",
        applicationId,
        jobId: job._id,
        // Don't set assignedTo/assignedCenterId here. Unassigned lead = admin assign karega.
        notes: `Auto lead created from job application. ApplicationId: ${applicationId}`,
      });
    } catch (leadErr) {
      console.error("Lead create error:", leadErr);
      // NOTE: lead create fail ho bhi jaye to application success rehna chahiye
    }

    res.status(201).json({
      message: "Application submitted successfully",
      application,
      remainingForms: activePackage.remainingForms,
    });
  } catch (error: any) {
    console.error("Apply error:", error);
    res.status(500).json({ message: error.message || "Failed to submit application" });
  }
});

router.get("/check-eligibility/:jobId", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { jobId } = req.params;

    const existingApplication = await Application.findOne({ userId, jobId });
    if (existingApplication) {
      return res.json({
        canApply: false,
        reason: "already_applied",
        application: existingApplication,
      });
    }

    const activePackage = await UserPackage.findOne({
      userId,
      status: "active",
      remainingForms: { $gt: 0 },
      expiresAt: { $gt: new Date() },
    });

    if (!activePackage) {
      return res.json({
        canApply: false,
        reason: "no_package",
        message: "No active package with remaining forms",
      });
    }

    const userDocuments = await UserDocument.find({ userId });
    const uploadedTypes = userDocuments.map((doc) => doc.type);

    const missingDocuments = REQUIRED_DOCUMENT_TYPES.filter((type) => !uploadedTypes.includes(type));

    if (missingDocuments.length > 0) {
      return res.json({
        canApply: false,
        reason: "missing_documents",
        message: "Please upload all required documents before applying",
        missingDocuments,
        requiredDocuments: REQUIRED_DOCUMENT_TYPES,
      });
    }

    res.json({
      canApply: true,
      remainingForms: activePackage.remainingForms,
      packageName: activePackage.packageName,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to check eligibility" });
  }
});

export default router;
