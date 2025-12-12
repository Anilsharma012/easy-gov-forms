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
