/**
 * TypeScript types and enums for the Digital Notary Platform
 */

// User Roles
export enum UserRole {
  COMPANY = 'company',
  NOTARY = 'notary',
  BANK = 'bank',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

// Document Types
export enum DocumentType {
  AADHAAR = 'aadhaar',
  PAN = 'pan',
  PASSPORT = 'passport',
  DRIVING_LICENSE = 'driving_license',
  VOTER_ID = 'voter_id',
  BUSINESS_REGISTRATION = 'business_registration',
  GST_CERTIFICATE = 'gst_certificate',
  INCORPORATION_CERTIFICATE = 'incorporation_certificate',
  BOARD_RESOLUTION = 'board_resolution',
  MOA = 'moa',
  AOA = 'aoa',
  FINANCIAL_STATEMENT = 'financial_statement',
  BANK_STATEMENT = 'bank_statement',
  PROPERTY_DEED = 'property_deed',
  LEASE_AGREEMENT = 'lease_agreement',
  LOAN_APPLICATION = 'loan_application',
  CONTRACT = 'contract',
  OTHER = 'other',
}

// Document Status
export enum DocumentStatus {
  UPLOADED = 'uploaded',
  OCR_PROCESSING = 'ocr_processing',
  OCR_COMPLETE = 'ocr_complete',
  FRAUD_CHECK = 'fraud_check',
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  NOTARIZED = 'notarized',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

// Notary Request Status
export enum NotaryRequestStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  IDENTITY_VERIFICATION = 'identity_verification',
  VIDEO_VERIFICATION = 'video_verification',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Company Types
export enum CompanyType {
  PRIVATE_LIMITED = 'private_limited',
  PUBLIC_LIMITED = 'public_limited',
  LLP = 'llp',
  PARTNERSHIP = 'partnership',
  SOLE_PROPRIETORSHIP = 'sole_proprietorship',
  OPC = 'opc',
  NGO = 'ngo',
  TRUST = 'trust',
  COOPERATIVE = 'cooperative',
}

// Notification Types
export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
  IN_APP = 'in_app',
}

// Audit Actions
export enum AuditAction {
  USER_REGISTER = 'user_register',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  PASSWORD_CHANGE = 'password_change',
  DOCUMENT_UPLOAD = 'document_upload',
  DOCUMENT_VIEW = 'document_view',
  DOCUMENT_DOWNLOAD = 'document_download',
  DOCUMENT_DELETE = 'document_delete',
  NOTARY_REQUEST = 'notary_request',
  NOTARY_APPROVE = 'notary_approve',
  NOTARY_REJECT = 'notary_reject',
  CERTIFICATE_ISSUE = 'certificate_issue',
  SIGNATURE_APPLY = 'signature_apply',
  FRAUD_DETECTED = 'fraud_detected',
  MFA_ENABLE = 'mfa_enable',
  MFA_DISABLE = 'mfa_disable',
  PROFILE_UPDATE = 'profile_update',
}

// User Interface
export interface User {
  uid: string;
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
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// Company Interface
export interface Company {
  id: string;
  ownerId: string;
  companyName: string;
  companyType: CompanyType;
  registrationNumber: string;
  taxId: string;
  address: Address;
  email: string;
  phone: string;
  website?: string;
  directors: Director[];
  createdAt: Date;
  updatedAt: Date;
}

// Address Interface
export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// Director Interface
export interface Director {
  name: string;
  email: string;
  phone: string;
  din?: string; // Director Identification Number
  designation: string;
}

// Document Interface
export interface Document {
  id: string;
  uploadedBy: string;
  companyId?: string;
  documentType: DocumentType;
  documentName: string;
  documentNumber?: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  ocrText?: string;
  fraudScore?: number;
  isEncrypted: boolean;
  isSigned: boolean;
  qrCodeUrl?: string;
  uploadedAt: Date;
  notarizedAt?: Date;
  expiresAt?: Date;
  metadata: DocumentMetadata;
}

// Document Metadata
export interface DocumentMetadata {
  pageCount?: number;
  dimensions?: { width: number; height: number };
  checksum?: string;
  extractedData?: Record<string, any>;
  fraudChecks?: FraudCheck[];
}

// Fraud Check
export interface FraudCheck {
  type: string;
  score: number;
  passed: boolean;
  details?: string;
  checkedAt: Date;
}

// Notary Request Interface
export interface NotaryRequest {
  id: string;
  requestedBy: string;
  companyId: string;
  notaryId?: string;
  documentId: string;
  requestNumber: string;
  status: NotaryRequestStatus;
  identityVerified: boolean;
  faceMatchScore?: number;
  livenessCheckPassed?: boolean;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  scheduledAt?: Date;
  completedAt?: Date;
}

// Notary Certificate Interface
export interface NotaryCertificate {
  id: string;
  notaryRequestId: string;
  documentId: string;
  notaryId: string;
  issuedTo: string;
  certificateNumber: string;
  certificatePdfUrl: string;
  qrCodeUrl: string;
  digitalSignature: string;
  issuedAt: Date;
  expiresAt?: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  revocationReason?: string;
}

// Audit Log Interface
export interface AuditLog {
  id: string;
  action: AuditAction;
  userId: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Notification Interface
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  agreeToTerms: boolean;
}

export interface DocumentUploadFormData {
  documentType: DocumentType;
  documentName: string;
  documentNumber?: string;
  file: File;
  companyId?: string;
}

export interface KYCFormData {
  aadhaarNumber?: string;
  panNumber?: string;
  passportNumber?: string;
  drivingLicenseNumber?: string;
  selfieFile?: File;
  aadhaarFrontFile?: File;
  aadhaarBackFile?: File;
  panFile?: File;
  passportFile?: File;
}

export interface CompanyFormData {
  companyName: string;
  companyType: CompanyType;
  registrationNumber: string;
  taxId: string;
  email: string;
  phone: string;
  website?: string;
  address: Address;
  directors: Director[];
}

// Dashboard Stats
export interface DashboardStats {
  totalDocuments: number;
  pendingVerifications: number;
  notarizedDocuments: number;
  rejectedDocuments: number;
  fraudDetected: number;
  activeUsers: number;
}

// Chart Data
export interface ChartDataPoint {
  label: string;
  value: number;
}
