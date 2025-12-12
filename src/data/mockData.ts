export interface Job {
  id: string;
  title: string;
  department: string;
  category: string;
  location: string;
  lastDate: string;
  eligibility: string;
  fees: {
    general: number;
    obc: number;
    sc: number;
    st: number;
  };
  vacancies: number;
  description: string;
  qualifications: string[];
  ageLimit: string;
  salary: string;
}

export interface Package {
  id: string;
  name: string;
  forms: number;
  price: number;
  originalPrice: number;
  features: string[];
  popular: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  department: string;
  applicationId: string;
  status: "pending" | "processing" | "submitted" | "completed" | "rejected";
  submissionDate: string;
  lastDate: string;
  packageUsed: string;
}

export interface Document {
  id: string;
  name: string;
  type: "aadhaar" | "pan" | "photo" | "signature" | "certificate" | "educational";
  fileName: string;
  uploadedAt: string;
  verified: boolean;
  size: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "deadline";
  read: boolean;
  createdAt: string;
}

export interface UserPackage {
  id: string;
  name: string;
  totalForms: number;
  usedForms: number;
  remainingForms: number;
  purchasedAt: string;
  expiresAt: string;
  status: "active" | "expired";
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: "payment" | "form" | "technical" | "query";
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  lastUpdated: string;
  messages: {
    sender: "user" | "support";
    message: string;
    timestamp: string;
  }[];
}

export const mockJobs: Job[] = [
  {
    id: "1",
    title: "SSC Combined Graduate Level (CGL) 2024",
    department: "Staff Selection Commission",
    category: "Central Government",
    location: "All India",
    lastDate: "2024-03-15",
    eligibility: "Graduate in any discipline",
    fees: { general: 100, obc: 100, sc: 0, st: 0 },
    vacancies: 8000,
    description: "Staff Selection Commission invites applications for Combined Graduate Level Examination 2024 for recruitment to various Group B and Group C posts.",
    qualifications: ["Bachelor's Degree from recognized University", "Age: 18-32 years"],
    ageLimit: "18-32 years",
    salary: "₹25,500 - ₹81,100",
  },
  {
    id: "2",
    title: "IBPS PO Recruitment 2024",
    department: "Institute of Banking Personnel Selection",
    category: "Banking",
    location: "All India",
    lastDate: "2024-02-28",
    eligibility: "Graduate with Computer Knowledge",
    fees: { general: 850, obc: 850, sc: 175, st: 175 },
    vacancies: 4500,
    description: "IBPS invites applications for recruitment of Probationary Officers/Management Trainees in participating banks.",
    qualifications: ["Bachelor's Degree from recognized University", "Computer literacy", "Age: 20-30 years"],
    ageLimit: "20-30 years",
    salary: "₹36,000 - ₹63,000",
  },
  {
    id: "3",
    title: "Railway NTPC Recruitment 2024",
    department: "Railway Recruitment Board",
    category: "Railways",
    location: "All India",
    lastDate: "2024-03-20",
    eligibility: "12th Pass / Graduate",
    fees: { general: 500, obc: 500, sc: 250, st: 250 },
    vacancies: 35000,
    description: "RRB invites applications for Non-Technical Popular Categories (NTPC) posts in various zones.",
    qualifications: ["12th Pass for some posts", "Graduate for higher posts", "Age: 18-33 years"],
    ageLimit: "18-33 years",
    salary: "₹19,900 - ₹63,200",
  },
  {
    id: "4",
    title: "UPSC Civil Services 2024",
    department: "Union Public Service Commission",
    category: "Central Government",
    location: "All India",
    lastDate: "2024-02-20",
    eligibility: "Graduate in any discipline",
    fees: { general: 100, obc: 100, sc: 0, st: 0 },
    vacancies: 1000,
    description: "UPSC conducts Civil Services Examination for recruitment to IAS, IPS, IFS and other Central Services.",
    qualifications: ["Bachelor's Degree from recognized University", "Age: 21-32 years"],
    ageLimit: "21-32 years",
    salary: "₹56,100 - ₹2,50,000",
  },
  {
    id: "5",
    title: "State Police Constable Recruitment",
    department: "State Police Department",
    category: "State Government",
    location: "Uttar Pradesh",
    lastDate: "2024-03-10",
    eligibility: "12th Pass",
    fees: { general: 400, obc: 400, sc: 200, st: 200 },
    vacancies: 52000,
    description: "UP Police invites applications for the post of Constable in Civil Police.",
    qualifications: ["12th Pass from recognized Board", "Physical fitness", "Age: 18-28 years"],
    ageLimit: "18-28 years",
    salary: "₹21,700 - ₹69,100",
  },
  {
    id: "6",
    title: "Indian Army Agniveer Rally 2024",
    department: "Indian Army",
    category: "Defence",
    location: "All India",
    lastDate: "2024-03-25",
    eligibility: "10th/12th Pass",
    fees: { general: 0, obc: 0, sc: 0, st: 0 },
    vacancies: 45000,
    description: "Indian Army invites applications from eligible male/female candidates for Agniveer recruitment.",
    qualifications: ["10th/12th Pass", "Physical Standards", "Age: 17.5-23 years"],
    ageLimit: "17.5-23 years",
    salary: "₹30,000 - ₹40,000",
  },
];

export const mockPackages: Package[] = [
  {
    id: "1",
    name: "Starter",
    forms: 10,
    price: 999,
    originalPrice: 1500,
    features: [
      "10 Form Applications",
      "AI-Assisted Form Filling",
      "Document Vault Access",
      "Email Support",
      "30 Days Validity",
    ],
    popular: false,
  },
  {
    id: "2",
    name: "Popular",
    forms: 20,
    price: 1799,
    originalPrice: 2800,
    features: [
      "20 Form Applications",
      "AI-Assisted Form Filling",
      "Document Vault Access",
      "Priority Email Support",
      "WhatsApp Support",
      "60 Days Validity",
    ],
    popular: true,
  },
  {
    id: "3",
    name: "Professional",
    forms: 50,
    price: 3999,
    originalPrice: 6500,
    features: [
      "50 Form Applications",
      "AI-Assisted Form Filling",
      "Document Vault Access",
      "Priority Support",
      "WhatsApp + Call Support",
      "90 Days Validity",
      "Dedicated Account Manager",
    ],
    popular: false,
  },
  {
    id: "4",
    name: "Enterprise",
    forms: 100,
    price: 6999,
    originalPrice: 12000,
    features: [
      "100 Form Applications",
      "AI-Assisted Form Filling",
      "Document Vault Access",
      "24/7 Priority Support",
      "WhatsApp + Call Support",
      "180 Days Validity",
      "Dedicated Account Manager",
      "Bulk Application Priority",
    ],
    popular: false,
  },
];

export const mockTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    location: "Delhi",
    rating: 5,
    text: "Easy Gov Forms made my life so much easier! I applied for 15 government jobs without any hassle. The AI form filling is amazing!",
    avatar: "RS",
  },
  {
    id: "2",
    name: "Priya Patel",
    location: "Gujarat",
    rating: 5,
    text: "I was always confused about form filling. This platform guided me step by step. Got my SSC CGL form submitted perfectly!",
    avatar: "PP",
  },
  {
    id: "3",
    name: "Amit Kumar",
    location: "Bihar",
    rating: 5,
    text: "The document vault feature is fantastic. I uploaded once and now I can apply to any job in seconds. Highly recommended!",
    avatar: "AK",
  },
  {
    id: "4",
    name: "Sneha Reddy",
    location: "Hyderabad",
    rating: 4,
    text: "Great service! The reminders about last dates saved me from missing important deadlines. Customer support is very helpful.",
    avatar: "SR",
  },
];

export const mockApplications: Application[] = [
  {
    id: "1",
    jobId: "1",
    jobTitle: "SSC Combined Graduate Level (CGL) 2024",
    department: "Staff Selection Commission",
    applicationId: "EGF-2024-001234",
    status: "completed",
    submissionDate: "2024-01-15",
    lastDate: "2024-03-15",
    packageUsed: "Popular (20 Forms)",
  },
  {
    id: "2",
    jobId: "2",
    jobTitle: "IBPS PO Recruitment 2024",
    department: "Institute of Banking Personnel Selection",
    applicationId: "EGF-2024-001235",
    status: "processing",
    submissionDate: "2024-01-20",
    lastDate: "2024-02-28",
    packageUsed: "Popular (20 Forms)",
  },
  {
    id: "3",
    jobId: "3",
    jobTitle: "Railway NTPC Recruitment 2024",
    department: "Railway Recruitment Board",
    applicationId: "EGF-2024-001236",
    status: "submitted",
    submissionDate: "2024-01-25",
    lastDate: "2024-03-20",
    packageUsed: "Popular (20 Forms)",
  },
  {
    id: "4",
    jobId: "4",
    jobTitle: "UPSC Civil Services 2024",
    department: "Union Public Service Commission",
    applicationId: "EGF-2024-001237",
    status: "pending",
    submissionDate: "2024-02-01",
    lastDate: "2024-02-20",
    packageUsed: "Popular (20 Forms)",
  },
];

export const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Aadhaar Card",
    type: "aadhaar",
    fileName: "aadhaar_card.pdf",
    uploadedAt: "2024-01-10",
    verified: true,
    size: "256 KB",
  },
  {
    id: "2",
    name: "PAN Card",
    type: "pan",
    fileName: "pan_card.pdf",
    uploadedAt: "2024-01-10",
    verified: true,
    size: "180 KB",
  },
  {
    id: "3",
    name: "Passport Photo",
    type: "photo",
    fileName: "passport_photo.jpg",
    uploadedAt: "2024-01-11",
    verified: true,
    size: "120 KB",
  },
  {
    id: "4",
    name: "Signature",
    type: "signature",
    fileName: "signature.jpg",
    uploadedAt: "2024-01-11",
    verified: true,
    size: "45 KB",
  },
  {
    id: "5",
    name: "10th Marksheet",
    type: "educational",
    fileName: "10th_marksheet.pdf",
    uploadedAt: "2024-01-12",
    verified: false,
    size: "512 KB",
  },
  {
    id: "6",
    name: "12th Marksheet",
    type: "educational",
    fileName: "12th_marksheet.pdf",
    uploadedAt: "2024-01-12",
    verified: false,
    size: "480 KB",
  },
  {
    id: "7",
    name: "Graduation Certificate",
    type: "educational",
    fileName: "graduation_certificate.pdf",
    uploadedAt: "2024-01-13",
    verified: true,
    size: "620 KB",
  },
  {
    id: "8",
    name: "Category Certificate (OBC)",
    type: "certificate",
    fileName: "obc_certificate.pdf",
    uploadedAt: "2024-01-13",
    verified: true,
    size: "340 KB",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Application Submitted Successfully",
    message: "Your application for SSC CGL 2024 has been submitted successfully.",
    type: "success",
    read: false,
    createdAt: "2024-02-01T10:30:00",
  },
  {
    id: "2",
    title: "Last Date Reminder",
    message: "UPSC Civil Services 2024 last date is in 5 days. Apply now!",
    type: "deadline",
    read: false,
    createdAt: "2024-02-15T09:00:00",
  },
  {
    id: "3",
    title: "New Job Alert",
    message: "Railway NTPC Recruitment 2024 matching your profile is now open.",
    type: "info",
    read: true,
    createdAt: "2024-01-28T14:00:00",
  },
  {
    id: "4",
    title: "Document Verified",
    message: "Your Graduation Certificate has been verified successfully.",
    type: "success",
    read: true,
    createdAt: "2024-01-20T11:30:00",
  },
  {
    id: "5",
    title: "Payment Successful",
    message: "Your payment of ₹1,799 for Popular Package was successful.",
    type: "success",
    read: true,
    createdAt: "2024-01-15T16:45:00",
  },
];

export const mockUserPackages: UserPackage[] = [
  {
    id: "1",
    name: "Popular (20 Forms)",
    totalForms: 20,
    usedForms: 7,
    remainingForms: 13,
    purchasedAt: "2024-01-15",
    expiresAt: "2024-03-15",
    status: "active",
  },
];

export const mockSupportTickets: SupportTicket[] = [
  {
    id: "1",
    subject: "Payment not reflecting in account",
    category: "payment",
    status: "resolved",
    priority: "high",
    createdAt: "2024-01-20",
    lastUpdated: "2024-01-22",
    messages: [
      {
        sender: "user",
        message: "I made a payment of ₹1,799 but the package is not showing in my account.",
        timestamp: "2024-01-20T10:00:00",
      },
      {
        sender: "support",
        message: "We have checked your payment. It was processed successfully. Please logout and login again to see the updated package.",
        timestamp: "2024-01-21T14:30:00",
      },
      {
        sender: "user",
        message: "Thank you! It's working now.",
        timestamp: "2024-01-22T09:00:00",
      },
    ],
  },
  {
    id: "2",
    subject: "Form filling assistance needed",
    category: "form",
    status: "open",
    priority: "medium",
    createdAt: "2024-02-01",
    lastUpdated: "2024-02-01",
    messages: [
      {
        sender: "user",
        message: "I need help filling the Railway NTPC form. Some fields are confusing.",
        timestamp: "2024-02-01T11:00:00",
      },
    ],
  },
];

export const mockUserProfile = {
  id: "1",
  name: "Rahul Sharma",
  email: "rahul.sharma@email.com",
  mobile: "+91 98765 43210",
  city: "New Delhi",
  state: "Delhi",
  joinedAt: "2024-01-10",
  referralCode: "RAHUL2024",
  referrals: 3,
  rewardPoints: 150,
};

export const jobCategories = [
  "All Categories",
  "Central Government",
  "State Government",
  "Banking",
  "Railways",
  "Defence",
  "PSU",
  "Teaching",
];

export const states = [
  "All States",
  "All India",
  "Uttar Pradesh",
  "Maharashtra",
  "Delhi",
  "Gujarat",
  "Rajasthan",
  "Bihar",
  "Madhya Pradesh",
  "Karnataka",
  "Tamil Nadu",
];

export const educationLevels = [
  "All Levels",
  "10th Pass",
  "12th Pass",
  "Graduate",
  "Post Graduate",
];