import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MedCentre Backend database seed...');

  // 1. Clear existing data in reverse order of relationships
  await prisma.notification.deleteMany();
  await prisma.adherenceLog.deleteMany();
  await prisma.medicationReminder.deleteMany();
  await prisma.healthRecord.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.prescriptionMedicine.deleteMany();
  await prisma.ocrResult.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicineInventory.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.pharmacy.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemHealth.deleteMany();

  // 2. Create SystemHealth check record
  await prisma.systemHealth.create({
    data: {
      service: 'medcentre-backend-api',
      status: 'healthy',
    },
  });

  // 3. Create Default Users (Hashed password: "Password123!")
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'MedCentre Master Administrator',
      email: 'admin@medcentre.com',
      phone: '+1 555-0100',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  const patientUser = await prisma.user.create({
    data: {
      name: 'Johnathan Doe',
      email: 'patient@medcentre.com',
      phone: '+1 555-0101',
      password: passwordHash,
      role: 'PATIENT',
    },
  });

  const doctorUser1 = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Connor, MD',
      email: 'doctor@medcentre.com',
      phone: '+1 555-0102',
      password: passwordHash,
      role: 'DOCTOR',
    },
  });

  const doctorUser2 = await prisma.user.create({
    data: {
      name: 'Dr. Marcus Vance, MD',
      email: 'marcus.vance@medcentre.com',
      phone: '+1 555-0103',
      password: passwordHash,
      role: 'DOCTOR',
    },
  });

  const pharmacyUser1 = await prisma.user.create({
    data: {
      name: 'City Care Pharmacy Manager',
      email: 'pharmacy@medcentre.com',
      phone: '+1 555-0104',
      password: passwordHash,
      role: 'PHARMACY',
    },
  });

  const pharmacyUser2 = await prisma.user.create({
    data: {
      name: 'HealthFirst Apothecary Manager',
      email: 'healthfirst@medcentre.com',
      phone: '+1 555-0105',
      password: passwordHash,
      role: 'PHARMACY',
    },
  });

  console.log('✅ Created 6 default role users');

  // 4. Create Doctor Profiles
  const doctor1 = await prisma.doctorProfile.create({
    data: {
      userId: doctorUser1.id,
      name: 'Dr. Sarah Connor, MD',
      speciality: 'Cardiology',
      qualification: 'MBBS, MD (Cardiology), FACC',
      experience: 14,
      consultationFee: 75.0,
      location: 'MedCentre Central Cardiology Wing, Suite 402',
      languages: 'English, Spanish',
      about: 'Senior Consultant Cardiologist specializing in preventive cardiovascular wellness, hypertension, and advanced lipidology.',
      availableDays: 'Mon,Tue,Wed,Thu,Fri',
      slotDuration: 30,
    },
  });

  const doctor2 = await prisma.doctorProfile.create({
    data: {
      userId: doctorUser2.id,
      name: 'Dr. Marcus Vance, MD',
      speciality: 'Neurology',
      qualification: 'MD, PhD (Neuroscience), FAAN',
      experience: 18,
      consultationFee: 90.0,
      location: 'Advanced Neurological Institute, District 4',
      languages: 'English, French, German',
      about: 'Clinical neurologist with focus on neurovascular disorders, chronic migraine management, and cognitive diagnostics.',
      availableDays: 'Mon,Wed,Fri,Sat',
      slotDuration: 30,
    },
  });

  await prisma.doctorProfile.create({
    data: {
      name: 'Dr. Elena Rostova, MD',
      speciality: 'Pediatrics',
      qualification: 'MBBS, DCH, MD (Pediatrics)',
      experience: 11,
      consultationFee: 60.0,
      location: 'Sunny Valley Children’s Hospital',
      languages: 'English, Russian',
      about: 'Dedicated pediatric specialist focused on child growth, adolescent medicine, and developmental diagnostics.',
      availableDays: 'Tue,Wed,Thu,Sat',
      slotDuration: 30,
    },
  });

  await prisma.doctorProfile.create({
    data: {
      name: 'Dr. Arthur Pendelton, MD',
      speciality: 'General Medicine',
      qualification: 'MBBS, FACP',
      experience: 22,
      consultationFee: 50.0,
      location: 'MedCentre Primary Care Pavilion',
      languages: 'English',
      about: 'Primary care physician providing comprehensive diagnostic workups, preventive medicine, and adult wellness.',
      availableDays: 'Mon,Tue,Wed,Thu,Fri,Sat',
      slotDuration: 20,
    },
  });

  console.log('✅ Created 4 doctor profiles');

  // 5. Create Pharmacies
  const pharmacy1 = await prisma.pharmacy.create({
    data: {
      userId: pharmacyUser1.id,
      name: 'City Care Pharmacy',
      address: '100 Medical Blvd, Healthcare District',
      latitude: 40.7128,
      longitude: -74.006,
      phone: '+1 555-0987',
      openingHours: '24/7 Full Service',
      deliveryAvailable: true,
      pickupAvailable: true,
      active: true,
    },
  });

  const pharmacy2 = await prisma.pharmacy.create({
    data: {
      userId: pharmacyUser2.id,
      name: 'HealthFirst Apothecary',
      address: '450 West End Avenue, Midtown',
      latitude: 40.7589,
      longitude: -73.9851,
      phone: '+1 555-0450',
      openingHours: '8:00 AM - 11:00 PM',
      deliveryAvailable: true,
      pickupAvailable: true,
      active: true,
    },
  });

  const pharmacy3 = await prisma.pharmacy.create({
    data: {
      name: 'Evergreen Medical Chemist',
      address: '742 Evergreen Terrace, Sector 4',
      latitude: 40.7306,
      longitude: -73.9352,
      phone: '+1 555-0742',
      openingHours: '7:30 AM - 10:00 PM',
      deliveryAvailable: true,
      pickupAvailable: true,
      active: true,
    },
  });

  console.log('✅ Created 3 verified pharmacies');

  // 6. Create Medicines Catalog
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
      name: 'Paracetamol 650mg Tablet',
      genericName: 'Acetaminophen / Paracetamol',
      brandName: 'Calpol',
      strength: '650mg',
      dosageForm: 'Tablet',
      category: 'Analgesics',
      manufacturer: 'GSK Consumer Health',
      prescriptionRequired: false,
      activeIngredients: 'Paracetamol 650mg',
    },
    {
      name: 'Atorvastatin 20mg Tablet',
      genericName: 'Atorvastatin Calcium',
      brandName: 'Lipitor',
      strength: '20mg',
      dosageForm: 'Tablet',
      category: 'Cardiovascular',
      manufacturer: 'Viatris / Pfizer',
      prescriptionRequired: true,
      activeIngredients: 'Atorvastatin 20mg',
    },
    {
      name: 'Metformin 850mg Tablet',
      genericName: 'Metformin Hydrochloride',
      brandName: 'Glucophage',
      strength: '850mg',
      dosageForm: 'Tablet',
      category: 'Antidiabetics',
      manufacturer: 'Merck Santé',
      prescriptionRequired: true,
      activeIngredients: 'Metformin HCl 850mg',
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
      name: 'Pantoprazole 40mg Tablet',
      genericName: 'Pantoprazole Sodium',
      brandName: 'Protonix',
      strength: '40mg',
      dosageForm: 'Tablet',
      category: 'Gastrointestinal',
      manufacturer: 'Pfizer Inc.',
      prescriptionRequired: true,
      activeIngredients: 'Pantoprazole Sodium 40mg',
    },
    {
      name: 'Azithromycin 500mg Tablet',
      genericName: 'Azithromycin Dihydrate',
      brandName: 'Zithromax',
      strength: '500mg',
      dosageForm: 'Tablet',
      category: 'Antibiotics',
      manufacturer: 'Pfizer',
      prescriptionRequired: true,
      activeIngredients: 'Azithromycin 500mg',
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
  ];

  const createdMedicines: any[] = [];
  for (const med of medicinesData) {
    const created = await prisma.medicine.create({ data: med });
    createdMedicines.push(created);
  }

  console.log(`✅ Created ${createdMedicines.length} master medicines`);

  // 7. Create Pharmacy Inventory Batches
  const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  for (const med of createdMedicines) {
    // Inventory in Pharmacy 1
    await prisma.medicineInventory.create({
      data: {
        pharmacyId: pharmacy1.id,
        medicineId: med.id,
        SKU: `SKU-CC-${med.name.slice(0, 3).toUpperCase()}-500`,
        batchNumber: `BAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: nextYear,
        quantity: 150,
        price: 12.5,
        MRP: 15.0,
      },
    });

    // Inventory in Pharmacy 2
    await prisma.medicineInventory.create({
      data: {
        pharmacyId: pharmacy2.id,
        medicineId: med.id,
        SKU: `SKU-HF-${med.name.slice(0, 3).toUpperCase()}-500`,
        batchNumber: `BAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: nextYear,
        quantity: 85,
        price: 13.0,
        MRP: 16.0,
      },
    });

    // Inventory in Pharmacy 3
    await prisma.medicineInventory.create({
      data: {
        pharmacyId: pharmacy3.id,
        medicineId: med.id,
        SKU: `SKU-EG-${med.name.slice(0, 3).toUpperCase()}-500`,
        batchNumber: `BAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: nextYear,
        quantity: 40,
        price: 11.5,
        MRP: 14.5,
      },
    });
  }

  console.log('✅ Created pharmacy inventory batches');

  // 8. Create Sample Prescription and Extracted Items
  const samplePrescription = await prisma.prescription.create({
    data: {
      userId: patientUser.id,
      doctorId: doctor1.id,
      fileName: 'Digital_Prescription_Cardiology.pdf',
      fileType: 'DIGITAL',
      fileSize: 1024 * 180,
      status: 'VERIFIED',
      verifiedAt: new Date(),
      notes: 'Take with full glass of water after food. Maintain low sodium diet.',
    },
  });

  const ocrDel = (prisma as any).oCRResult || (prisma as any).ocrResult;
  await ocrDel.create({
    data: {
      prescriptionId: samplePrescription.id,
      rawText: 'Rx: Amoxicillin 500mg Capsule, Paracetamol 650mg Tablet, Atorvastatin 20mg Tablet. Sign: Dr. Sarah Connor, MD.',
      confidence: 0.98,
    },
  });

  await prisma.prescriptionMedicine.createMany({
    data: [
      {
        prescriptionId: samplePrescription.id,
        medicineId: createdMedicines[0].id,
        medicineName: createdMedicines[0].name,
        strength: '500mg',
        dosageForm: 'Capsule',
        frequency: 'Twice daily',
        duration: '7 days',
        quantity: 14,
        confidence: 0.99,
        isVerified: true,
      },
      {
        prescriptionId: samplePrescription.id,
        medicineId: createdMedicines[1].id,
        medicineName: createdMedicines[1].name,
        strength: '650mg',
        dosageForm: 'Tablet',
        frequency: 'As needed for fever',
        duration: '5 days',
        quantity: 10,
        confidence: 0.97,
        isVerified: true,
      },
      {
        prescriptionId: samplePrescription.id,
        medicineId: createdMedicines[2].id,
        medicineName: createdMedicines[2].name,
        strength: '20mg',
        dosageForm: 'Tablet',
        frequency: 'Once daily at bedtime',
        duration: '30 days',
        quantity: 30,
        confidence: 0.96,
        isVerified: true,
      },
    ],
  });

  console.log('✅ Created sample verified digital prescription');

  // 9. Create Health Record Vault Item
  await prisma.healthRecord.create({
    data: {
      userId: patientUser.id,
      title: 'Digital Prescription — Cardiology (Dr. Sarah Connor, MD)',
      category: 'PRESCRIPTIONS',
      fileName: 'Digital_Prescription_Cardiology.pdf',
      fileType: 'application/pdf',
      fileSize: 1024 * 180,
      recordDate: new Date().toISOString().split('T')[0],
      doctorName: 'Dr. Sarah Connor, MD',
      description: 'Prescription for cardiovascular maintenance and antibacterial regimen.',
      prescriptionId: samplePrescription.id,
    },
  });

  await prisma.healthRecord.create({
    data: {
      userId: patientUser.id,
      title: 'Complete Blood Count & Lipid Profile Report',
      category: 'LAB_REPORTS',
      fileName: 'CBC_Lipid_Panel_Report.pdf',
      fileType: 'application/pdf',
      fileSize: 1024 * 320,
      recordDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      doctorName: 'Metropolitan Clinical Diagnostics',
      description: 'Total cholesterol: 185 mg/dL, HDL: 52 mg/dL, LDL: 108 mg/dL. Normal range.',
    },
  });

  console.log('✅ Created sample health records');

  // 10. Create Medication Reminders
  const reminder1 = await prisma.medicationReminder.create({
    data: {
      userId: patientUser.id,
      medicineName: 'Amoxicillin 500mg Capsule',
      dose: '1 Capsule (500mg)',
      time: '08:00 AM',
      frequency: 'TWICE_DAILY',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      instructions: 'Take with breakfast',
      isActive: true,
    },
  });

  await prisma.adherenceLog.create({
    data: {
      reminderId: reminder1.id,
      action: 'TAKEN',
      actionDate: new Date().toISOString().split('T')[0],
      actionTime: '08:05 AM',
      notes: 'Taken on schedule with breakfast',
    },
  });

  // 11. Create Sample Appointment
  await prisma.appointment.create({
    data: {
      appointmentNumber: 'APT-2026-100234',
      patientId: patientUser.id,
      doctorId: doctor1.id,
      date: '2026-09-20',
      time: '10:00 AM',
      status: 'CONFIRMED',
      reason: 'Routine quarterly cardiovascular wellness checkup',
    },
  });

  // 12. Create Sample Notification
  await prisma.notification.create({
    data: {
      userId: patientUser.id,
      title: 'Prescription Ready for Pharmacy Fulfillment',
      message: 'Dr. Sarah Connor has issued your digital prescription. You can now compare local pharmacy prices and order medicines.',
      type: 'PRESCRIPTION_UPDATE',
      link: '/prescriptions/scan',
      isRead: false,
    },
  });

  console.log('🎉 MedCentre Backend database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
