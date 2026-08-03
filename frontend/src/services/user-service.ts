/**
 * User Service - Uses Supabase for user profiles
 * Firebase Auth handles authentication, Supabase stores user data
 */
import { supabase, UserRow, UserInsert, UserUpdate } from '@/lib/supabase';
import { UserRole } from '@/types';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  photoURL?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  isActive: boolean;
  isApproved: boolean;
  mfaEnabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class UserService {
  /**
   * Create user profile in Supabase after Firebase Auth registration
   */
  async createUserProfile(firebaseUid: string, data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    photoURL?: string;
  }): Promise<UserProfile> {
    const userInsert: UserInsert = {
      id: firebaseUid,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      full_name: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      role: data.role,
      photo_url: data.photoURL,
      is_email_verified: false,
      is_phone_verified: false,
      is_identity_verified: false,
      is_active: true,
      is_approved: data.role !== UserRole.NOTARY, // Notaries need approval
      mfa_enabled: false,
    };

    const { data: user, error } = await supabase
      .from('users')
      .insert(userInsert)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }

    return this.mapToUserProfile(user);
  }

  /**
   * Get user profile by Firebase UID
   */
  async getUserProfile(firebaseUid: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', firebaseUid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return null;
      }
      throw new Error(`Failed to get user profile: ${error.message}`);
    }

    return this.mapToUserProfile(data);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    firebaseUid: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const userUpdate: UserUpdate = {
      ...(updates.firstName && { first_name: updates.firstName }),
      ...(updates.lastName && { last_name: updates.lastName }),
      ...(updates.fullName && { full_name: updates.fullName }),
      ...(updates.phone && { phone: updates.phone }),
      ...(updates.photoURL !== undefined && { photo_url: updates.photoURL }),
      ...(updates.isEmailVerified !== undefined && { is_email_verified: updates.isEmailVerified }),
      ...(updates.isPhoneVerified !== undefined && { is_phone_verified: updates.isPhoneVerified }),
      ...(updates.isIdentityVerified !== undefined && { is_identity_verified: updates.isIdentityVerified }),
      ...(updates.isActive !== undefined && { is_active: updates.isActive }),
      ...(updates.isApproved !== undefined && { is_approved: updates.isApproved }),
      ...(updates.mfaEnabled !== undefined && { mfa_enabled: updates.mfaEnabled }),
    };

    const { data, error } = await supabase
      .from('users')
      .update(userUpdate)
      .eq('id', firebaseUid)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    return this.mapToUserProfile(data);
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(firebaseUid: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', firebaseUid);

    if (error) {
      console.error('Failed to update last login:', error);
      // Non-critical, don't throw
    }
  }

  /**
   * Create or update user profile (for OAuth)
   */
  async createOrUpdateUserProfile(
    firebaseUid: string,
    data: {
      email: string;
      displayName?: string;
      photoURL?: string;
      phoneNumber?: string;
      emailVerified: boolean;
    },
    defaultRole: UserRole = UserRole.COMPANY
  ): Promise<UserProfile> {
    // Check if user exists
    const existingUser = await this.getUserProfile(firebaseUid);

    if (existingUser) {
      // Update last login
      await this.updateLastLogin(firebaseUid);
      return existingUser;
    }

    // Create new user
    const nameParts = data.displayName?.split(' ') || ['', ''];
    return this.createUserProfile(firebaseUid, {
      email: data.email,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      phone: data.phoneNumber,
      role: defaultRole,
      photoURL: data.photoURL,
    });
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to get users by role: ${error.message}`);
    }

    return data.map(this.mapToUserProfile);
  }

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(20);

    if (error) {
      throw new Error(`Failed to search users: ${error.message}`);
    }

    return data.map(this.mapToUserProfile);
  }

  /**
   * Map database row to UserProfile
   */
  private mapToUserProfile(row: UserRow): UserProfile {
    return {
      id: row.id,
      email: row.email ?? '',
      firstName: row.first_name ?? '',
      lastName: row.last_name ?? '',
      fullName: row.full_name ?? `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim(),
      phone: row.phone ?? undefined,
      role: (row.role as UserRole) ?? UserRole.COMPANY,
      photoURL: row.photo_url ?? undefined,
      isEmailVerified: row.is_email_verified ?? false,
      isPhoneVerified: row.is_phone_verified ?? false,
      isIdentityVerified: row.is_identity_verified ?? false,
      isActive: row.is_active ?? true,
      isApproved: row.is_approved ?? false,
      mfaEnabled: row.mfa_enabled ?? false,
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
      createdAt: new Date(row.created_at ?? new Date().toISOString()),
      updatedAt: new Date(row.updated_at ?? new Date().toISOString()),
    };
  }
}

export const userService = new UserService();
