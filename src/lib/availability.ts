import { prisma } from './prisma';

export interface AvailableMedicineDetail {
  prescriptionMedicineId: string;
  medicineName: string;
  requiredQuantity: number;
  unitPrice: number;
  totalItemPrice: number;
  inStockQuantity: number;
  batchNumber: string;
  expiryDate: string;
  isAvailable: boolean;
}

export interface PharmacyMatchResult {
  pharmacy: {
    id: string;
    name: string;
    address: string;
    phone: string;
    openingHours: string;
    deliveryAvailable: boolean;
    pickupAvailable: boolean;
    latitude: number | null;
    longitude: number | null;
  };
  availableCount: number;
  totalCount: number;
  isFullyAvailable: boolean;
  totalPrice: number;
  distanceKm: number | null;
  availableMedicines: AvailableMedicineDetail[];
  unavailableMedicines: {
    medicineName: string;
    strength: string;
    requiredQuantity: number;
  }[];
}

// Haversine Distance Helper in Kilometers
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export class AvailabilityEngine {
  public static async findPharmaciesForPrescription(
    prescriptionId: string,
    userLat?: number,
    userLng?: number
  ): Promise<{
    prescription: any;
    pharmacies: PharmacyMatchResult[];
  }> {
    // 1. Fetch prescription with medicines
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        medicines: {
          include: {
            medicine: true,
          },
        },
      },
    });

    if (!prescription) {
      throw new Error(`Prescription '${prescriptionId}' not found.`);
    }

    // 2. Fetch active pharmacies
    const activePharmacies = await prisma.pharmacy.findMany({
      where: { active: true },
      include: {
        inventories: {
          include: {
            medicine: true,
          },
        },
      },
    });

    const now = new Date();
    const prescriptionMedicines = prescription.medicines;
    const totalCount = prescriptionMedicines.length;

    // 3. Match prescription medicines against each pharmacy's inventory
    const matches: PharmacyMatchResult[] = [];

    for (const pharmacy of activePharmacies) {
      let availableCount = 0;
      let totalPrice = 0;

      const availableMedicines: AvailableMedicineDetail[] = [];
      const unavailableMedicines: { medicineName: string; strength: string; requiredQuantity: number }[] = [];

      for (const pm of prescriptionMedicines) {
        // Find matching valid inventory item (quantity > 0 AND expiryDate > now)
        const matchingInventory = pharmacy.inventories.find((inv) => {
          const isValidStock = inv.quantity > 0 && new Date(inv.expiryDate) > now;

          if (!isValidStock) return false;

          // Direct medicine ID match
          if (pm.medicineId && inv.medicineId === pm.medicineId) {
            return true;
          }

          // Fallback name & strength match
          const nameMatch =
            inv.medicine.name.toLowerCase().includes(pm.medicineName.toLowerCase()) ||
            pm.medicineName.toLowerCase().includes(inv.medicine.name.toLowerCase()) ||
            inv.medicine.brandName.toLowerCase().includes(pm.medicineName.toLowerCase());

          return nameMatch;
        });

        if (matchingInventory) {
          availableCount++;
          const itemPrice = matchingInventory.price * pm.quantity;
          totalPrice += itemPrice;

          availableMedicines.push({
            prescriptionMedicineId: pm.id,
            medicineName: pm.medicineName,
            requiredQuantity: pm.quantity,
            unitPrice: matchingInventory.price,
            totalItemPrice: itemPrice,
            inStockQuantity: matchingInventory.quantity,
            batchNumber: matchingInventory.batchNumber,
            expiryDate: matchingInventory.expiryDate.toISOString(),
            isAvailable: true,
          });
        } else {
          unavailableMedicines.push({
            medicineName: pm.medicineName,
            strength: pm.strength,
            requiredQuantity: pm.quantity,
          });
        }
      }

      // Calculate distance if coordinates present
      let distanceKm: number | null = null;
      if (userLat !== undefined && userLng !== undefined && pharmacy.latitude && pharmacy.longitude) {
        distanceKm = calculateHaversineDistance(userLat, userLng, pharmacy.latitude, pharmacy.longitude);
      }

      matches.push({
        pharmacy: {
          id: pharmacy.id,
          name: pharmacy.name,
          address: pharmacy.address,
          phone: pharmacy.phone,
          openingHours: pharmacy.openingHours,
          deliveryAvailable: pharmacy.deliveryAvailable,
          pickupAvailable: pharmacy.pickupAvailable,
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude,
        },
        availableCount,
        totalCount,
        isFullyAvailable: availableCount === totalCount && totalCount > 0,
        totalPrice: Math.round(totalPrice * 100) / 100,
        distanceKm,
        availableMedicines,
        unavailableMedicines,
      });
    }

    // 4. RANKING ALGORITHM
    // 1. All medicines available first (isFullyAvailable = true)
    // 2. Highest available count (availableCount desc)
    // 3. Lowest total estimated price (totalPrice asc)
    // 4. Distance (distanceKm asc)
    matches.sort((a, b) => {
      if (a.isFullyAvailable !== b.isFullyAvailable) {
        return a.isFullyAvailable ? -1 : 1;
      }
      if (a.availableCount !== b.availableCount) {
        return b.availableCount - a.availableCount;
      }
      if (a.totalPrice !== b.totalPrice) {
        return a.totalPrice - b.totalPrice;
      }
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      return 0;
    });

    return {
      prescription: {
        id: prescription.id,
        fileName: prescription.fileName,
        status: prescription.status,
        medicinesCount: totalCount,
      },
      pharmacies: matches,
    };
  }

  public static async findPharmaciesForMedicine(
    medicineId: string,
    userLat?: number,
    userLng?: number
  ) {
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
    });

    if (!medicine) {
      throw new Error(`Medicine '${medicineId}' not found.`);
    }

    const now = new Date();

    const activePharmacies = await prisma.pharmacy.findMany({
      where: { active: true },
      include: {
        inventories: {
          where: {
            medicineId,
            quantity: { gt: 0 },
            expiryDate: { gt: now },
          },
        },
      },
    });

    const matchingPharmacies = activePharmacies
      .filter((pharmacy) => pharmacy.inventories.length > 0)
      .map((pharmacy) => {
        const inventory = pharmacy.inventories[0];
        let distanceKm: number | null = null;
        if (userLat !== undefined && userLng !== undefined && pharmacy.latitude && pharmacy.longitude) {
          distanceKm = calculateHaversineDistance(userLat, userLng, pharmacy.latitude, pharmacy.longitude);
        }

        return {
          pharmacy: {
            id: pharmacy.id,
            name: pharmacy.name,
            address: pharmacy.address,
            phone: pharmacy.phone,
            openingHours: pharmacy.openingHours,
            deliveryAvailable: pharmacy.deliveryAvailable,
            pickupAvailable: pharmacy.pickupAvailable,
            latitude: pharmacy.latitude,
            longitude: pharmacy.longitude,
          },
          inventory: {
            id: inventory.id,
            SKU: inventory.SKU,
            batchNumber: inventory.batchNumber,
            quantity: inventory.quantity,
            price: inventory.price,
            MRP: inventory.MRP,
            expiryDate: inventory.expiryDate.toISOString(),
          },
          distanceKm,
        };
      });

    // Rank by price ascending, then distance
    matchingPharmacies.sort((a, b) => {
      if (a.inventory.price !== b.inventory.price) {
        return a.inventory.price - b.inventory.price;
      }
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      return 0;
    });

    return {
      medicine,
      pharmacies: matchingPharmacies,
    };
  }
}
