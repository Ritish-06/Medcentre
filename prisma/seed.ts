import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Seed Test Users
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const users = [
    {
      name: 'John Patient',
      email: 'patient@medcentre.com',
      phone: '+1 555-0100',
      password: hashedPassword,
      role: 'PATIENT',
    },
    {
      name: 'Dr. Sarah Connor',
      email: 'doctor@medcentre.com',
      phone: '+1 555-0200',
      password: hashedPassword,
      role: 'DOCTOR',
    },
    {
      name: 'City Care Pharmacy',
      email: 'pharmacy@medcentre.com',
      phone: '+1 555-0300',
      password: hashedPassword,
      role: 'PHARMACY',
    },
    {
      name: 'System Administrator',
      email: 'admin@medcentre.com',
      phone: '+1 555-0400',
      password: hashedPassword,
      role: 'ADMIN',
    },
  ];

  const seededUsers: Record<string, any> = {};

  for (const user of users) {
    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: user.password,
        role: user.role,
        phone: user.phone,
      },
      create: user,
    });
    seededUsers[user.email] = dbUser;
  }

  console.log('Seeded users for PATIENT, DOCTOR, PHARMACY, and ADMIN.');

  // 2. Seed 22 Safe Development Medicines
  const medicinesData = [
    {
      name: 'Amoxicillin 500mg Capsule',
      genericName: 'Amoxicillin',
      brandName: 'Amoxil',
      strength: '500mg',
      dosageForm: 'Capsule',
      category: 'Antibiotics',
      manufacturer: 'GlaxoSmithKline',
      prescriptionRequired: true,
      activeIngredients: 'Amoxicillin Trihydrate 500mg',
    },
    {
      name: 'Paracetamol 500mg Tablet',
      genericName: 'Paracetamol',
      brandName: 'Panadol',
      strength: '500mg',
      dosageForm: 'Tablet',
      category: 'Analgesics',
      manufacturer: 'Haleon',
      prescriptionRequired: false,
      activeIngredients: 'Paracetamol 500mg',
    },
    {
      name: 'Ibuprofen 400mg Tablet',
      genericName: 'Ibuprofen',
      brandName: 'Advil',
      strength: '400mg',
      dosageForm: 'Tablet',
      category: 'Analgesics',
      manufacturer: 'Pfizer',
      prescriptionRequired: false,
      activeIngredients: 'Ibuprofen 400mg',
    },
    {
      name: 'Metformin 850mg Tablet',
      genericName: 'Metformin Hydrochloride',
      brandName: 'Glucophage',
      strength: '850mg',
      dosageForm: 'Tablet',
      category: 'Antidiabetics',
      manufacturer: 'Merck Healthcare',
      prescriptionRequired: true,
      activeIngredients: 'Metformin HCl 850mg',
    },
    {
      name: 'Atorvastatin 20mg Tablet',
      genericName: 'Atorvastatin Calcium',
      brandName: 'Lipitor',
      strength: '20mg',
      dosageForm: 'Tablet',
      category: 'Cardiovascular',
      manufacturer: 'Viatris',
      prescriptionRequired: true,
      activeIngredients: 'Atorvastatin Calcium 20mg',
    },
    {
      name: 'Amlodipine 5mg Tablet',
      genericName: 'Amlodipine Besylate',
      brandName: 'Norvasc',
      strength: '5mg',
      dosageForm: 'Tablet',
      category: 'Cardiovascular',
      manufacturer: 'Pfizer',
      prescriptionRequired: true,
      activeIngredients: 'Amlodipine Besylate 5mg',
    },
    {
      name: 'Omeprazole 20mg Capsule',
      genericName: 'Omeprazole',
      brandName: 'Prilosec',
      strength: '20mg',
      dosageForm: 'Capsule',
      category: 'Gastrointestinal',
      manufacturer: 'AstraZeneca',
      prescriptionRequired: false,
      activeIngredients: 'Omeprazole Magnesium 20mg',
    },
    {
      name: 'Cetirizine 10mg Tablet',
      genericName: 'Cetirizine Hydrochloride',
      brandName: 'Zyrtec',
      strength: '10mg',
      dosageForm: 'Tablet',
      category: 'Antihistamines',
      manufacturer: 'Johnson & Johnson',
      prescriptionRequired: false,
      activeIngredients: 'Cetirizine HCl 10mg',
    },
    {
      name: 'Azithromycin 250mg Tablet',
      genericName: 'Azithromycin',
      brandName: 'Zithromax',
      strength: '250mg',
      dosageForm: 'Tablet',
      category: 'Antibiotics',
      manufacturer: 'Pfizer',
      prescriptionRequired: true,
      activeIngredients: 'Azithromycin Dihydrate 250mg',
    },
    {
      name: 'Salbutamol 100mcg Inhaler',
      genericName: 'Salbutamol / Albuterol',
      brandName: 'Ventolin HFA',
      strength: '100mcg',
      dosageForm: 'Inhaler',
      category: 'Respiratory',
      manufacturer: 'GlaxoSmithKline',
      prescriptionRequired: true,
      activeIngredients: 'Salbutamol Sulfate 100mcg per puff',
    },
  ];

  const seededMedicines: any[] = [];
  for (const med of medicinesData) {
    let dbMed = await prisma.medicine.findFirst({
      where: { name: med.name },
    });
    if (!dbMed) {
      dbMed = await prisma.medicine.create({ data: med });
    }
    seededMedicines.push(dbMed);
  }

  console.log(`Seeded ${seededMedicines.length} medicines.`);

  // 3. Seed Pharmacies
  const pharmacyUser = seededUsers['pharmacy@medcentre.com'];

  const cityCarePharmacy = await prisma.pharmacy.upsert({
    where: { name: 'City Care Pharmacy' },
    update: { userId: pharmacyUser?.id },
    create: {
      name: 'City Care Pharmacy',
      userId: pharmacyUser?.id,
      address: '102 Health Avenue, Downtown Medical District',
      latitude: 40.7128,
      longitude: -74.006,
      phone: '+1 555-0300',
      openingHours: '8:00 AM - 10:00 PM',
      deliveryAvailable: true,
      pickupAvailable: true,
      active: true,
    },
  });

  const metroPharmacy = await prisma.pharmacy.upsert({
    where: { name: 'Metro Health Pharmacy' },
    update: {},
    create: {
      name: 'Metro Health Pharmacy',
      address: '405 Grand Central Blvd, East Side',
      latitude: 40.7589,
      longitude: -73.9851,
      phone: '+1 555-0899',
      openingHours: '7:30 AM - 11:00 PM',
      deliveryAvailable: true,
      pickupAvailable: true,
      active: true,
    },
  });

  console.log('Seeded Pharmacies (City Care Pharmacy, Metro Health Pharmacy).');

  // 4. Seed Medicine Inventory (Valid, Out-of-Stock, and Expired items)
  await prisma.medicineInventory.deleteMany({
    where: { pharmacyId: cityCarePharmacy.id },
  });

  const futureExpiry = new Date('2027-12-31T00:00:00Z');
  const pastExpiry = new Date('2025-01-01T00:00:00Z'); // Expired date

  if (seededMedicines.length >= 6) {
    await prisma.medicineInventory.createMany({
      data: [
        // Valid In-Stock Medicines
        {
          pharmacyId: cityCarePharmacy.id,
          medicineId: seededMedicines[0].id, // Amoxicillin
          SKU: 'SKU-AMX-500',
          batchNumber: 'BATCH-2026-A1',
          expiryDate: futureExpiry,
          quantity: 150,
          price: 12.5,
          MRP: 15.0,
        },
        {
          pharmacyId: cityCarePharmacy.id,
          medicineId: seededMedicines[1].id, // Paracetamol
          SKU: 'SKU-PCM-500',
          batchNumber: 'BATCH-2026-P2',
          expiryDate: futureExpiry,
          quantity: 200,
          price: 4.99,
          MRP: 6.5,
        },
        {
          pharmacyId: cityCarePharmacy.id,
          medicineId: seededMedicines[2].id, // Ibuprofen
          SKU: 'SKU-IBU-400',
          batchNumber: 'BATCH-2026-I3',
          expiryDate: futureExpiry,
          quantity: 80,
          price: 8.25,
          MRP: 10.0,
        },
        // Out of Stock Item (quantity = 0)
        {
          pharmacyId: cityCarePharmacy.id,
          medicineId: seededMedicines[3].id, // Metformin
          SKU: 'SKU-MET-850',
          batchNumber: 'BATCH-2026-M4',
          expiryDate: futureExpiry,
          quantity: 0, // OUT OF STOCK
          price: 18.0,
          MRP: 22.0,
        },
        // EXPIRED Item (expiryDate in the past)
        {
          pharmacyId: cityCarePharmacy.id,
          medicineId: seededMedicines[4].id, // Atorvastatin
          SKU: 'SKU-ATV-20',
          batchNumber: 'BATCH-2024-EXP1',
          expiryDate: pastExpiry, // EXPIRED!
          quantity: 50,
          price: 25.0,
          MRP: 30.0,
        },
        {
          pharmacyId: cityCarePharmacy.id,
          medicineId: seededMedicines[5].id, // Amlodipine
          SKU: 'SKU-AML-5',
          batchNumber: 'BATCH-2026-A5',
          expiryDate: futureExpiry,
          quantity: 120,
          price: 11.0,
          MRP: 14.0,
        },
      ],
    });

    console.log('Seeded Medicine Inventory for City Care Pharmacy (including Out-of-Stock and Expired test items).');
  }

  // 4. Seed Doctor Profiles
  const doctorUser = seededUsers['doctor@medcentre.com'];

  const doctorsData = [
    {
      userId: doctorUser?.id,
      name: 'Dr. Sarah Connor, MD',
      speciality: 'Cardiology',
      qualification: 'MBBS, MD (Cardiology), FACC',
      experience: 14,
      consultationFee: 75.0,
      location: 'Central Cardiac Institute, Suite 402, Downtown',
      languages: 'English, Spanish',
      about: 'Senior Consultant Cardiologist specializing in preventive cardiology, hypertension management, and non-invasive cardiovascular imaging.',
      availableDays: 'Mon,Tue,Wed,Thu,Fri',
      slotDuration: 30,
    },
    {
      name: 'Dr. Robert Chen, MD',
      speciality: 'Dermatology',
      qualification: 'MBBS, MD (Dermatology), FAAD',
      experience: 10,
      consultationFee: 60.0,
      location: 'Metro Skin & Laser Clinic, 2nd Floor, East Wing',
      languages: 'English, Mandarin',
      about: 'Board-certified dermatologist with expertise in clinical dermatology, acne treatments, eczema, and skin allergy diagnostics.',
      availableDays: 'Mon,Tue,Wed,Fri,Sat',
      slotDuration: 30,
    },
    {
      name: 'Dr. Emily Watson, MD',
      speciality: 'Pediatrics',
      qualification: 'MBBS, DCH, MD (Pediatrics)',
      experience: 12,
      consultationFee: 50.0,
      location: 'Little Care Children Hospital, Pediatric Wing',
      languages: 'English, French',
      about: 'Dedicated pediatrician providing comprehensive child wellness care, immunization schedules, and developmental assessments.',
      availableDays: 'Mon,Tue,Wed,Thu,Fri,Sat',
      slotDuration: 30,
    },
    {
      name: 'Dr. Marcus Vance, MD',
      speciality: 'General Medicine',
      qualification: 'MBBS, MD (Internal Medicine)',
      experience: 16,
      consultationFee: 45.0,
      location: 'Springfield Community Health Center, Ground Floor',
      languages: 'English, German',
      about: 'Primary care physician experienced in adult chronic disease management, diabetes, thyroid disorders, and routine health checks.',
      availableDays: 'Mon,Tue,Wed,Thu,Fri',
      slotDuration: 30,
    },
    {
      name: 'Dr. Priya Sharma, MD',
      speciality: 'Neurology',
      qualification: 'MBBS, MD, DM (Neurology)',
      experience: 11,
      consultationFee: 85.0,
      location: 'NeuroScience Center of Excellence, 5th Floor',
      languages: 'English, Hindi',
      about: 'Consultant Neurologist specializing in headache disorders, epilepsy management, neuropathy, and stroke rehabilitation.',
      availableDays: 'Tue,Wed,Thu,Sat',
      slotDuration: 30,
    },
    {
      name: 'Dr. James Anderson, MS',
      speciality: 'Orthopedics',
      qualification: 'MBBS, MS (Orthopedics), MCh',
      experience: 15,
      consultationFee: 70.0,
      location: 'Bone & Joint Clinic, Medical Enclave',
      languages: 'English',
      about: 'Orthopedic specialist focusing on joint pain management, sports injuries, arthritis care, and post-fracture rehabilitation.',
      availableDays: 'Mon,Wed,Thu,Fri',
      slotDuration: 30,
    },
  ];

  for (const doc of doctorsData) {
    const existing = await prisma.doctorProfile.findFirst({
      where: { name: doc.name },
    });
    if (!existing) {
      await prisma.doctorProfile.create({
        data: doc,
      });
    }
  }

  console.log('Seeded 6 diverse Doctor Profiles across multiple specialities.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
