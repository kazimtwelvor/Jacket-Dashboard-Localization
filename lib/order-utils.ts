import prismadb from "./prismadb";

/**
 * Generates the next sequential order ID in format ord-4560, ord-4561, etc.
 * @param storeId - The store ID to generate order ID for
 * @returns Promise<string> - The next sequential order ID
 */
export async function generateNextOrderId(storeId: string): Promise<string> {
  try {
    // Get the latest order for this store
    const latestOrder = await prismadb.order.findFirst({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      select: { id: true }
    });

    let nextNumber = 4560; // Start from 4560
    
    if (latestOrder && latestOrder.id) {
      // Extract the number from the ID (assuming format like "ord-4560")
      const match = latestOrder.id.match(/ord-(\d+)/);
      if (match) {
        const currentNumber = parseInt(match[1]);
        if (!isNaN(currentNumber)) {
          nextNumber = currentNumber + 1;
        }
      }
    }

    // Format as ord-XXXX
    return `ord-${nextNumber}`;
  } catch (error) {
    console.error('Error generating order ID:', error);
    // Fallback to timestamp-based ID if there's an error
    return `ord-${Date.now()}`;
  }
}

/**
 * Validates if an order ID follows the expected format
 * @param orderId - The order ID to validate
 * @returns boolean - True if valid format
 */
export function isValidOrderId(orderId: string): boolean {
  return /^ord-\d+$/.test(orderId);
}