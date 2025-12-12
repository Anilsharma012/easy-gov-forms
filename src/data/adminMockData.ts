// Admin-specific mock data
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  state: string;
  registeredAt: string;
  status: "active" | "inactive" | "banned";
  kycVerified: boolean;
  totalApplications: number;
  activePackage: string | null;
}

export interface CSCCenter {
  id: string;
  centerName: string;
  ownerName: string;
  email: string;
  mobile: string;
  address: string;
  district: string;
  state: string;
  status: "pending" | "verified" | "rejected";
  registeredAt: string;
  leadsAssigned: number;
}

export interface Lead {
  id: string;
  name: string;
  mobile: string;
  email: string;
  type: "job" | "scheme" | "document";
  formName: string;
  assignedTo: string | null;
  status: "new" | "in-progress" | "completed" | "cancelled";
  createdAt: string;
}

export interface AdminPayment {
  id: string;
  paymentId: string;
  userId: string;
  userName: string;
  packageName: string;
  amount: number;
  method: "upi" | "card" | "netbanking" | "wallet";
  status: "success" | "failed" | "pending" | "refunded";
  createdAt: string;
}

export interface AdminTicket {
  id: string;
  ticketId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: "payment" | "form" | "technical" | "query";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "assigned" | "in-progress" | "resolved" | "closed";
  assignedTo: string | null;
  createdAt: string;
  lastUpdated: string;
}

export interface ContentItem {
  id: string;
  type: "blog" | "faq" | "testimonial";
  title: string;
  status: "published" | "draft";
  createdAt: string;
  views: number;
}

export const mockAdminUsers: AdminUser[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    email: "rahul.sharma@email.com",
    mobile: "+91 98765 43210",
    city: "New Delhi",
    state: "Delhi",
    registeredAt: "2024-01-10",
    status: "active",
    kycVerified: true,
    totalApplications: 7,
    activePackage: "Popular (20 Forms)",
  },
  {
    id: "2",
    name: "Priya Patel",
    email: "priya.patel@email.com",
    mobile: "+91 87654 32109",
    city: "Ahmedabad",
    state: "Gujarat",
    registeredAt: "2024-01-15",
    status: "active",
    kycVerified: true,
    totalApplications: 12,
    activePackage: "Professional (50 Forms)",
  },
  {
    id: "3",
    name: "Amit Kumar",
    email: "amit.kumar@email.com",
    mobile: "+91 76543 21098",
    city: "Patna",
    state: "Bihar",
    registeredAt: "2024-01-20",
    status: "active",
    kycVerified: false,
    totalApplications: 3,
    activePackage: "Starter (10 Forms)",
  },
  {
    id: "4",
    name: "Sneha Reddy",
    email: "sneha.reddy@email.com",
    mobile: "+91 65432 10987",
    city: "Hyderabad",
    state: "Telangana",
    registeredAt: "2024-02-01",
    status: "inactive",
    kycVerified: true,
    totalApplications: 5,
    activePackage: null,
  },
  {
    id: "5",
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    mobile: "+91 54321 09876",
    city: "Jaipur",
    state: "Rajasthan",
    registeredAt: "2024-02-05",
    status: "banned",
    kycVerified: false,
    totalApplications: 0,
    activePackage: null,
  },
];

export const mockCSCCenters: CSCCenter[] = [
  {
    id: "1",
    centerName: "Digital Seva Kendra",
    ownerName: "Rajesh Verma",
    email: "rajesh.verma@csc.com",
    mobile: "+91 99887 76655",
    address: "Shop No. 12, Main Market",
    district: "Lucknow",
    state: "Uttar Pradesh",
    status: "verified",
    registeredAt: "2024-01-05",
    leadsAssigned: 45,
  },
  {
    id: "2",
    centerName: "Jan Seva Kendra",
    ownerName: "Suresh Yadav",
    email: "suresh.yadav@csc.com",
    mobile: "+91 88776 65544",
    address: "Near Bus Stand",
    district: "Varanasi",
    state: "Uttar Pradesh",
    status: "pending",
    registeredAt: "2024-02-10",
    leadsAssigned: 0,
  },
  {
    id: "3",
    centerName: "E-Mitra Center",
    ownerName: "Mahesh Sharma",
    email: "mahesh.sharma@csc.com",
    mobile: "+91 77665 54433",
    address: "Gandhi Nagar",
    district: "Jaipur",
    state: "Rajasthan",
    status: "verified",
    registeredAt: "2024-01-20",
    leadsAssigned: 78,
  },
];

export const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Arun Mishra",
    mobile: "+91 99001 12233",
    email: "arun.mishra@email.com",
    type: "job",
    formName: "SSC CGL 2024",
    assignedTo: "Digital Seva Kendra",
    status: "in-progress",
    createdAt: "2024-02-15",
  },
  {
    id: "2",
    name: "Kavita Devi",
    mobile: "+91 88112 23344",
    email: "kavita.devi@email.com",
    type: "scheme",
    formName: "PM Kisan Yojana",
    assignedTo: null,
    status: "new",
    createdAt: "2024-02-16",
  },
  {
    id: "3",
    name: "Ravi Shankar",
    mobile: "+91 77223 34455",
    email: "ravi.shankar@email.com",
    type: "document",
    formName: "Passport Application",
    assignedTo: "E-Mitra Center",
    status: "completed",
    createdAt: "2024-02-10",
  },
];

export const mockAdminPayments: AdminPayment[] = [
  {
    id: "1",
    paymentId: "PAY-2024-001234",
    userId: "1",
    userName: "Rahul Sharma",
    packageName: "Popular (20 Forms)",
    amount: 1799,
    method: "upi",
    status: "success",
    createdAt: "2024-02-15T10:30:00",
  },
  {
    id: "2",
    paymentId: "PAY-2024-001235",
    userId: "2",
    userName: "Priya Patel",
    packageName: "Professional (50 Forms)",
    amount: 3999,
    method: "card",
    status: "success",
    createdAt: "2024-02-14T15:45:00",
  },
  {
    id: "3",
    paymentId: "PAY-2024-001236",
    userId: "3",
    userName: "Amit Kumar",
    packageName: "Starter (10 Forms)",
    amount: 999,
    method: "netbanking",
    status: "failed",
    createdAt: "2024-02-13T09:20:00",
  },
  {
    id: "4",
    paymentId: "PAY-2024-001237",
    userId: "4",
    userName: "Sneha Reddy",
    packageName: "Popular (20 Forms)",
    amount: 1799,
    method: "upi",
    status: "refunded",
    createdAt: "2024-02-12T14:00:00",
  },
];

export const mockAdminTickets: AdminTicket[] = [
  {
    id: "1",
    ticketId: "TKT-2024-0001",
    userName: "Rahul Sharma",
    userEmail: "rahul.sharma@email.com",
    subject: "Payment not reflecting in account",
    category: "payment",
    priority: "high",
    status: "resolved",
    assignedTo: "Support Agent 1",
    createdAt: "2024-01-20",
    lastUpdated: "2024-01-22",
  },
  {
    id: "2",
    ticketId: "TKT-2024-0002",
    userName: "Priya Patel",
    userEmail: "priya.patel@email.com",
    subject: "Form filling assistance needed",
    category: "form",
    priority: "medium",
    status: "open",
    assignedTo: null,
    createdAt: "2024-02-01",
    lastUpdated: "2024-02-01",
  },
  {
    id: "3",
    ticketId: "TKT-2024-0003",
    userName: "Amit Kumar",
    userEmail: "amit.kumar@email.com",
    subject: "Unable to upload documents",
    category: "technical",
    priority: "urgent",
    status: "in-progress",
    assignedTo: "Support Agent 2",
    createdAt: "2024-02-15",
    lastUpdated: "2024-02-16",
  },
];

export const mockContentItems: ContentItem[] = [
  {
    id: "1",
    type: "blog",
    title: "How to Prepare for SSC CGL 2024",
    status: "published",
    createdAt: "2024-01-15",
    views: 2500,
  },
  {
    id: "2",
    type: "blog",
    title: "Top 10 Government Jobs in 2024",
    status: "published",
    createdAt: "2024-01-20",
    views: 4200,
  },
  {
    id: "3",
    type: "faq",
    title: "How do I upload my documents?",
    status: "published",
    createdAt: "2024-01-10",
    views: 890,
  },
  {
    id: "4",
    type: "testimonial",
    title: "Rahul Sharma - Delhi",
    status: "published",
    createdAt: "2024-01-25",
    views: 350,
  },
];

export const adminStats = {
  totalUsers: 1250,
  activeUsers: 890,
  totalRevenue: 485000,
  monthlyRevenue: 125000,
  totalApplications: 3400,
  pendingApplications: 156,
  openTickets: 23,
  cscCenters: 45,
};