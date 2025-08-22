import prismadb from "@/lib/prismadb"

// Define role hierarchy for permission checks
const roleHierarchy = {
  OWNER: 5,
  ADMIN: 4,
  MANAGER: 3,
  EDITOR: 2,
  SUPPORT: 1,
  VIEWER: 0,
}

// Define permissions for each role
const rolePermissions = {
  OWNER: [
    "MANAGE_STORE",
    "MANAGE_PRODUCTS",
    "MANAGE_ORDERS",
    "MANAGE_CUSTOMERS",
    "MANAGE_STAFF",
    "MANAGE_SETTINGS",
    "MANAGE_MARKETING",
    "VIEW_ANALYTICS",
    "PROCESS_REFUNDS",
    "MANAGE_REVIEWS",
  ],
  ADMIN: [
    "MANAGE_STORE",
    "MANAGE_PRODUCTS",
    "MANAGE_ORDERS",
    "MANAGE_CUSTOMERS",
    "MANAGE_STAFF",
    "MANAGE_SETTINGS",
    "MANAGE_MARKETING",
    "VIEW_ANALYTICS",
    "PROCESS_REFUNDS",
    "MANAGE_REVIEWS",
  ],
  MANAGER: [
    "MANAGE_PRODUCTS",
    "MANAGE_ORDERS",
    "MANAGE_CUSTOMERS",
    "MANAGE_MARKETING",
    "VIEW_ANALYTICS",
    "PROCESS_REFUNDS",
    "MANAGE_REVIEWS",
  ],
  EDITOR: ["MANAGE_PRODUCTS", "VIEW_ANALYTICS", "MANAGE_REVIEWS"],
  SUPPORT: ["MANAGE_ORDERS", "MANAGE_CUSTOMERS", "VIEW_ANALYTICS"],
  VIEWER: ["VIEW_ANALYTICS"],
}

// Check if a user has access to a store
export const checkUserStoreAccess = async (clerkUserId: string, storeId: string) => {
  try {
    // First, find the user by Clerk ID
    const user = await prismadb.user.findUnique({
      where: {
        clerkId: clerkUserId,
      },
    })

    if (!user) {
      return false
    }

    // Check if user is a store member
    const storeUser = await prismadb.storeUser.findFirst({
      where: {
        userId: user.id,
        storeId: storeId,
      },
    })

    return !!storeUser
  } catch (error) {
    console.error("Error checking store access:", error)
    return false
  }
}

// Check if a user has a specific permission for a store
export const checkUserPermission = async (clerkUserId: string, storeId: string, permission: string) => {
  try {
    // First, find the user by Clerk ID
    const user = await prismadb.user.findUnique({
      where: {
        clerkId: clerkUserId,
      },
    })

    if (!user) {
      return false
    }

    // Check if user is a store member and get their role
    const storeUser = await prismadb.storeUser.findFirst({
      where: {
        userId: user.id,
        storeId: storeId,
      },
    })

    if (!storeUser) {
      return false
    }

    // If user is the owner, they have all permissions
    if (storeUser.isOwner) {
      return true
    }

    // Check if the user's role has the required permission
    const userRole = storeUser.role
    return rolePermissions[userRole].includes(permission)
  } catch (error) {
    console.error("Error checking permission:", error)
    return false
  }
}

// Get user's role for a store
export const getUserStoreRole = async (clerkUserId: string, storeId: string) => {
  try {
    // First, find the user by Clerk ID
    const user = await prismadb.user.findUnique({
      where: {
        clerkId: clerkUserId,
      },
    })

    if (!user) {
      return null
    }

    // Get user's store role
    const storeUser = await prismadb.storeUser.findFirst({
      where: {
        userId: user.id,
        storeId: storeId,
      },
    })

    if (!storeUser) {
      return null
    }

    return storeUser.role
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}

// Check if a user can manage another user (based on role hierarchy)
export const canManageUser = async (managerClerkId: string, targetUserId: string, storeId: string) => {
  try {
    // First, find the manager by Clerk ID
    const manager = await prismadb.user.findUnique({
      where: {
        clerkId: managerClerkId,
      },
    })

    if (!manager) {
      return false
    }

    // Get manager's store role
    const managerStoreUser = await prismadb.storeUser.findFirst({
      where: {
        userId: manager.id,
        storeId: storeId,
      },
    })

    if (!managerStoreUser) {
      return false
    }

    // If manager is the owner, they can manage anyone
    if (managerStoreUser.isOwner) {
      return true
    }

    // Get target user's store role
    const targetStoreUser = await prismadb.storeUser.findFirst({
      where: {
        id: targetUserId,
        storeId: storeId,
      },
    })

    if (!targetStoreUser) {
      return false
    }

    // Cannot manage the owner
    if (targetStoreUser.isOwner) {
      return false
    }

    // Check if manager's role is higher in hierarchy than target's role
    return roleHierarchy[managerStoreUser.role] > roleHierarchy[targetStoreUser.role]
  } catch (error) {
    console.error("Error checking user management permission:", error)
    return false
  }
}

