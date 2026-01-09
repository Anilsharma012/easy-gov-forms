import mongoose from 'mongoose';
import IndianGovForm from '../models/IndianGovForm';
import UrgentBanner from '../models/UrgentBanner';

const seedForms = [
  {
    title: 'SSC CGL 2024 Application',
    department: 'Staff Selection Commission',
    fee: 100,
    status: 'new',
    isActive: true,
    order: 1,
  },
  {
    title: 'Income Certificate Request',
    department: 'Revenue Department',
    processingTime: '7 Days',
    status: 'popular',
    isActive: true,
    order: 2,
  },
  {
    title: 'Passport Renewal',
    department: 'Ministry of External Affairs',
    docsRequired: 3,
    status: 'popular',
    isActive: true,
    order: 3,
  },
  {
    title: 'State Scholarship 2023',
    department: 'Education Department',
    status: 'closed',
    isActive: true,
    order: 4,
  },
  {
    title: 'Ration Card Application',
    department: 'Food & Civil Supplies',
    processingTime: '15 Days',
    docsRequired: 5,
    status: 'popular',
    isActive: true,
    order: 5,
  },
];

const seedBanners = [
  {
    title: 'PM Awas Yojana Update',
    description: 'Deadline extended for 2024 applications to Oct 30th.',
    buttonText: 'Check Status',
    buttonLink: '/govt-jobs',
    isActive: true,
    priority: 10,
  },
  {
    title: 'New SSC Recruitment 2025',
    description: 'Applications open for Combined Graduate Level exam.',
    buttonText: 'Apply Now',
    buttonLink: '/govt-jobs',
    isActive: true,
    priority: 5,
  },
];

export async function seedFormsAndBanners() {
  try {
    const formsCount = await IndianGovForm.countDocuments();
    const bannersCount = await UrgentBanner.countDocuments();

    if (formsCount === 0) {
      await IndianGovForm.insertMany(seedForms);
      console.log('Seeded Indian Government Forms');
    } else {
      console.log('Forms already exist, skipping seed');
    }

    if (bannersCount === 0) {
      await UrgentBanner.insertMany(seedBanners);
      console.log('Seeded Urgent Banners');
    } else {
      console.log('Banners already exist, skipping seed');
    }

    return { formsSeeded: formsCount === 0, bannersSeeded: bannersCount === 0 };
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}
