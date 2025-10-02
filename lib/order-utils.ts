import prismadb from "./prismadb";

/**
 * Generates the next sequential order ID in format ORD-04560, ORD-04561, etc.
 * @param storeId - The store ID to generate order ID for
 * @returns Promise<string> - The next sequential order ID
 */
export async function generateNextOrderId(storeId: string): Promise<string> {
  try {
    // Get the latest order for this store
    const latestOrder = await prismadb.order.findFirst({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    let nextNumber = 45600; // Start from 45600

    if (latestOrder && latestOrder.id) {
      // Extract the number from the ID (assuming format like "ORD-04560")
      const match = latestOrder.id.match(/ORD-(\d+)/);
      if (match) {
        const currentNumber = parseInt(match[1]);
        if (!isNaN(currentNumber)) {
          nextNumber = currentNumber + 1;
        }
      }
    }

    // Format as ORD-XXXXX
    return `ORD-${nextNumber}`;
  } catch (error) {
    console.error("Error generating order ID:", error);
    // Fallback to timestamp-based ID if there's an error
    return `ORD-${Date.now()}`;
  }
}

/**
 * Validates if an order ID follows the expected format
 * @param orderId - The order ID to validate
 * @returns boolean - True if valid format
 */
export function isValidOrderId(orderId: string): boolean {
  return /^ORD-\d+$/.test(orderId);
}
