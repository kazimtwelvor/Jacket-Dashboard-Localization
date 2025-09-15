import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import prismadb from "@/lib/prismadb"
import { Permission, Role, DEFAULT_ROLE_PERMISSIONS } from "@/types/permissions"

export interface PermissionCheckResult {
  hasPermission: boolean
  userRole?: string
  isOwner?: boolean
  error?: NextResponse
}


export async function checkApiPermission(
  storeId: string,
  permission: Permission,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET'
): Promise<PermissionCheckResult> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return {
        hasPermission: false,
        error: new NextResponse("Unauthenticated", { status: 401 })
      }
    }

    if (!storeId) {
      return {
        hasPermission: false,
        error: new NextResponse("Store ID is required", { status: 400 })
      }
    }

    const dbUser = await prismadb.user.findUnique({
      where: { clerkId: userId }
    })

    if (!dbUser) {
      return {
        hasPermission: false,
        error: new NextResponse("User not found", { status: 404 })
      }
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId: dbUser.id
      }
    })

    if (store) {
      return {
        hasPermission: true,
        userRole: Role.OWNER,
        isOwner: true
      }
    }

    const storeUser = await prismadb.storeUser.findFirst({
      where: {
        storeId: storeId,
        userId: dbUser.id
      }
    })

    if (!storeUser) {
      return {
        hasPermission: false,
        error: new NextResponse("Access denied. You don't have permission to access this store.", { status: 403 })
      }
    }

    const userRole = storeUser.role as Role
    const userPermissions = DEFAULT_ROLE_PERMISSIONS[userRole] || []
    const hasPermission = userPermissions.includes(permission)

    if (!hasPermission) {
      return {
        hasPermission: false,
        userRole,
        error: new NextResponse(`Access denied. You don't have permission to ${method.toLowerCase()} ${permission.toLowerCase().replace(/_/g, ' ')}.`, { status: 403 })
      }
    }

    return {
      hasPermission: true,
      userRole,
      isOwner: false
    }

  } catch (error) {
    console.error("Permission check error:", error)
    return {
      hasPermission: false,
      error: new NextResponse("Internal server error", { status: 500 })
    }
  }
}


export function withPermission(
  permission: Permission,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET'
) {
  return async function permissionMiddleware(
    storeId: string,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const permissionCheck = await checkApiPermission(storeId, permission, method)
    
    if (permissionCheck.error) {
      return permissionCheck.error
    }

    if (!permissionCheck.hasPermission) {
      return new NextResponse("Access denied", { status: 403 })
    }

    return handler()
  }
}

export function getPermissionForMethod(
  resource: 'PRODUCTS' | 'CATEGORIES' | 'ORDERS' | 'BILLBOARDS' | 'SIZES' | 'COLORS' | 'USERS',
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
): Permission {
  switch (method) {
    case 'GET':
      return `VIEW_${resource}` as Permission
    case 'POST':
      return `CREATE_${resource}` as Permission
    case 'PATCH':
      return `EDIT_${resource}` as Permission
    case 'DELETE':
      return `DELETE_${resource}` as Permission
    default:
      return `VIEW_${resource}` as Permission
  }
}

export const SPECIAL_PERMISSIONS = {
  'MANAGE_ORDERS': Permission.MANAGE_ORDERS,
  'MANAGE_PRODUCTS': Permission.MANAGE_ORDERS, 
  'MANAGE_USERS': Permission.MANAGE_USERS,
} as const
