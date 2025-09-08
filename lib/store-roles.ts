import prismadb from "@/lib/prismadb"

const roleHierarchy = {
  OWNER: 5,
  ADMIN: 4,
  MANAGER: 3,
  EDITOR: 2,
  SUPPORT: 1,
  VIEWER: 0,
}

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

export const checkUserStoreAccess = async (clerkUserId: string, storeId: string) => {
  try {
    const user = await prismadb.user.findUnique({
      where: {
        clerkId: clerkUserId,
      },
    })

    if (!user) {
      return false
    }

    const storeUser = await prismadb.storeUser.findFirst({
      where: {
        userId: user.id,
        storeId: storeId,
      },
    })

    return !!storeUser
  } catch (error) {
    return false
  }
}

export const checkUserPermission = async (clerkUserId: string, storeId: string, permission: string) => {
  try {
    const user = await prismadb.user.findUnique({
      where: {
        clerkId: clerkUserId,
      },
    })

    if (!user) {
      return false
    }

    const storeUser = await prismadb.storeUser.findFirst({
      where: {
        userId: user.id,
        storeId: storeId,
      },
    })

    if (!storeUser) {
      return false
    }

    if (storeUser.isOwner) {
      return true
    }

    const userRole = storeUser.role
    return rolePermissions[userRole].includes(permission)
  } catch (error) {
    return false
  }
}

export const getUserStoreRole = async (clerkUserId: string, storeId: string) => {
  try {
    const user = await prismadb.user.findUnique({
      where: {
        clerkId: clerkUserId,
      },
    })

    if (!user) {
      return null
    }

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
    return null
  }
}

export const canManageUser = async (managerClerkId: string, targetUserId: string, storeId: string) => {
  try {
    const manager = await prismadb.user.findUnique({
      where: {
        clerkId: managerClerkId,
      },
    })

    if (!manager) {
      return false
    }

    const managerStoreUser = await prismadb.storeUser.findFirst({
      where: {
        userId: manager.id,
        storeId: storeId,
      },
    })

    if (!managerStoreUser) {
      return false
    }

    if (managerStoreUser.isOwner) {
      return true
    }

    const targetStoreUser = await prismadb.storeUser.findFirst({
      where: {
        id: targetUserId,
        storeId: storeId,
      },
    })

    if (!targetStoreUser) {
      return false
    }

    if (targetStoreUser.isOwner) {
      return false
    }

    return roleHierarchy[managerStoreUser.role] > roleHierarchy[targetStoreUser.role]
  } catch (error) {
    return false
  }
}

