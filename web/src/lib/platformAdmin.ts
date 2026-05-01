/** Platform operator tenant (see Backend userRoutes.js). */
export const PLATFORM_ADMIN_TENANT_ID = 'tenant-artiola'

export function isPlatformAdmin(user: {
  role?: string
  tenant_id?: string | number | null
} | null): boolean {
  if (!user) return false
  return user.role === 'super_admin' && String(user.tenant_id) === PLATFORM_ADMIN_TENANT_ID
}
