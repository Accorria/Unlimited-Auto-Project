// Authentication utilities for Accorria × Unlimited Auto RBAC System

import { createClient } from '@supabase/supabase-js';
import { AuthUser, UserRole, Permission } from './types';

// Check if we're in a build environment (no env vars available)
const isBuildTime = typeof window === 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL;

// Create a dummy client for build time
const dummyClient = {
  auth: { 
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ 
      data: { subscription: { unsubscribe: () => {} } } 
    })
  },
  from: () => ({ 
    select: () => ({ 
      eq: () => ({ 
        eq: () => ({ 
          single: () => Promise.resolve({ data: null, error: null }) 
        }) 
      }) 
    }) 
  }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: { message: 'Storage not configured', statusCode: '500' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      remove: () => Promise.resolve({ data: null, error: null }),
      list: () => Promise.resolve({ data: [], error: null })
    }),
    listBuckets: () => Promise.resolve({ data: [], error: null })
  }
};

export const supabase = isBuildTime 
  ? dummyClient as any
  : createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      }
    );

// Server-side service role client
export function createServerClient() {
  if (isBuildTime) {
    return dummyClient as any;
  }
  
  // Check if service role key is available
  if (!process.env.SUPABASE_SERVICE_ROLE) {
    console.warn('SUPABASE_SERVICE_ROLE not found, using regular client');
    return supabase;
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    { auth: { persistSession: false } }
  );
}

// Get current authenticated user with role and dealer info
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return null;
    }

    // Get user profile with role and dealer info
    // Use service role client to bypass RLS policy issues
    const serverClient = createServerClient();
    const { data: userProfile, error: profileError } = await serverClient
      .from('users')
      .select(`
        id,
        role,
        email,
        name,
        is_active,
        dealer_id
      `)
      .eq('auth_user_id', authUser.id)
      .eq('is_active', true)
      .single();

    if (profileError || !userProfile) {
      console.error('Profile error:', profileError);
      return null;
    }

    // Get dealer info separately to avoid join issues
    let dealerInfo = null;
    if (userProfile.dealer_id) {
      const { data: dealer, error: dealerError } = await serverClient
        .from('dealers')
        .select('id, slug, name, is_active')
        .eq('id', userProfile.dealer_id)
        .single();
      
      if (dealerError) {
        console.error('Dealer error:', dealerError);
      } else {
        dealerInfo = dealer;
      }
    }

    // Check if dealer is active (if we have dealer info)
    if (dealerInfo && !dealerInfo.is_active) {
      return null;
    }

    return {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      role: userProfile.role,
      dealer_id: userProfile.dealer_id,
      dealer_slug: dealerInfo?.slug || null,
      dealer_name: dealerInfo?.name || null,
      is_active: userProfile.is_active
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Check if user has permission for an action
export function hasPermission(
  user: AuthUser | null,
  action: string,
  resource: string,
  resourceData?: any
): boolean {
  if (!user || !user.is_active) {
    return false;
  }

  // Super Admin has all permissions
  if (user.role === 'super_admin') {
    return true;
  }

  // Dealer Admin permissions
  if (user.role === 'dealer_admin') {
    switch (action) {
      case 'view':
        return resource === 'dealers' || resource === 'users' || resource === 'vehicles' || resource === 'leads' || resource === 'analytics';
      case 'create':
      case 'update':
      case 'delete':
        return resource === 'users' || resource === 'vehicles' || resource === 'leads';
      case 'manage_roles':
        return resource === 'users' && resourceData?.role !== 'super_admin';
      case 'view_all_dealers':
        return false;
      case 'create_dealers':
        return false;
      case 'activate_dealer':
        return false;
      default:
        return false;
    }
  }

  // Sales Manager permissions
  if (user.role === 'sales_manager') {
    switch (action) {
      case 'view':
        return resource === 'vehicles' || resource === 'leads' || resource === 'analytics';
      case 'create':
      case 'update':
      case 'delete':
        return resource === 'vehicles' || resource === 'leads';
      case 'assign_leads':
        return resource === 'leads';
      case 'view_all_leads':
        return resource === 'leads';
      default:
        return false;
    }
  }

  // Sales Rep permissions
  if (user.role === 'sales_rep') {
    switch (action) {
      case 'view':
        return resource === 'leads' || resource === 'vehicles';
      case 'update':
        return resource === 'leads' && resourceData?.assigned_to === user.id;
      case 'upload_photos':
        return resource === 'vehicles' && resourceData?.assigned_to === user.id;
      case 'view_own_leads':
        return resource === 'leads' && resourceData?.assigned_to === user.id;
      default:
        return false;
    }
  }

  return false;
}

// Get user's permissions
export function getUserPermissions(user: AuthUser | null): Permission[] {
  if (!user) return [];

  const permissions: Permission[] = [];

  // Super Admin permissions
  if (user.role === 'super_admin') {
    permissions.push(
      { action: 'view', resource: 'all', allowed: true },
      { action: 'create', resource: 'all', allowed: true },
      { action: 'update', resource: 'all', allowed: true },
      { action: 'delete', resource: 'all', allowed: true },
      { action: 'manage_roles', resource: 'users', allowed: true },
      { action: 'view_all_dealers', resource: 'dealers', allowed: true },
      { action: 'create_dealers', resource: 'dealers', allowed: true },
      { action: 'activate_dealer', resource: 'dealers', allowed: true }
    );
  }

  // Dealer Admin permissions
  if (user.role === 'dealer_admin') {
    permissions.push(
      { action: 'view', resource: 'users', allowed: true },
      { action: 'create', resource: 'users', allowed: true },
      { action: 'update', resource: 'users', allowed: true },
      { action: 'delete', resource: 'users', allowed: true },
      { action: 'manage_roles', resource: 'users', allowed: true },
      { action: 'view', resource: 'vehicles', allowed: true },
      { action: 'create', resource: 'vehicles', allowed: true },
      { action: 'update', resource: 'vehicles', allowed: true },
      { action: 'delete', resource: 'vehicles', allowed: true },
      { action: 'view', resource: 'leads', allowed: true },
      { action: 'create', resource: 'leads', allowed: true },
      { action: 'update', resource: 'leads', allowed: true },
      { action: 'delete', resource: 'leads', allowed: true },
      { action: 'assign_leads', resource: 'leads', allowed: true },
      { action: 'view', resource: 'analytics', allowed: true },
      { action: 'view', resource: 'billing', allowed: true }
    );
  }

  // Sales Manager permissions
  if (user.role === 'sales_manager') {
    permissions.push(
      { action: 'view', resource: 'vehicles', allowed: true },
      { action: 'create', resource: 'vehicles', allowed: true },
      { action: 'update', resource: 'vehicles', allowed: true },
      { action: 'delete', resource: 'vehicles', allowed: true },
      { action: 'view', resource: 'leads', allowed: true },
      { action: 'create', resource: 'leads', allowed: true },
      { action: 'update', resource: 'leads', allowed: true },
      { action: 'delete', resource: 'leads', allowed: true },
      { action: 'assign_leads', resource: 'leads', allowed: true },
      { action: 'view', resource: 'analytics', allowed: true }
    );
  }

  // Sales Rep permissions
  if (user.role === 'sales_rep') {
    permissions.push(
      { action: 'view', resource: 'leads', allowed: true },
      { action: 'update', resource: 'leads', allowed: true },
      { action: 'view', resource: 'vehicles', allowed: true },
      { action: 'upload_photos', resource: 'vehicles', allowed: true }
    );
  }

  return permissions;
}

// Check if user can access a specific route
export function canAccessRoute(user: AuthUser | null, route: string): boolean {
  if (!user) return false;

  // Super Admin can access everything
  if (user.role === 'super_admin') {
    return true;
  }

  // Route-based permissions
  const routePermissions: Record<string, UserRole[]> = {
    '/admin/dashboard': ['super_admin', 'dealer_admin', 'sales_manager', 'sales_rep'],
    '/admin/users': ['super_admin', 'dealer_admin'],
    '/admin/inventory': ['super_admin', 'dealer_admin', 'sales_manager'],
    '/admin/leads': ['super_admin', 'dealer_admin', 'sales_manager', 'sales_rep'],
    '/admin/analytics': ['super_admin', 'dealer_admin', 'sales_manager'],
    '/admin/billing': ['super_admin', 'dealer_admin'],
    '/admin/settings': ['super_admin', 'dealer_admin'],
    '/admin/upload': ['super_admin', 'dealer_admin', 'sales_manager', 'sales_rep']
  };

  const allowedRoles = routePermissions[route];
  return allowedRoles ? allowedRoles.includes(user.role) : false;
}

// Sign out user
export async function signOut() {
  await supabase.auth.signOut();
  // Clear any additional session data
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
  }
}

// Get role display name
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    'super_admin': 'Super Master Admin',
    'dealer_admin': 'Dealer Owner/Admin',
    'sales_manager': 'Sales Manager',
    'sales_rep': 'Sales Rep'
  };
  return roleNames[role] || role;
}

// Get role level (for hierarchy)
export function getRoleLevel(role: UserRole): number {
  const roleLevels: Record<UserRole, number> = {
    'super_admin': 1,
    'dealer_admin': 2,
    'sales_manager': 3,
    'sales_rep': 4
  };
  return roleLevels[role] || 5;
}

// Check if user can manage another user's role
export function canManageUserRole(currentUser: AuthUser, targetUserRole: UserRole): boolean {
  if (currentUser.role === 'super_admin') {
    return true;
  }
  
  if (currentUser.role === 'dealer_admin') {
    // DA can only manage SM and SR roles, not SMA
    return targetUserRole === 'sales_manager' || targetUserRole === 'sales_rep';
  }
  
  return false;
}
