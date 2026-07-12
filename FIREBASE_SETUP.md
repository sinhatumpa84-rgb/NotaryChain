# Firebase Setup Guide for Digital Notary Platform

This guide explains how to set up Firebase for the Digital Notary Platform using your existing Firebase project.

## Firebase Project Details

**Project ID**: `signal-scout-483d5`
**Project Name**: Signal Scout
**Region**: Default

## What Firebase Provides

Firebase offers a comprehensive backend-as-a-service with:

- **Authentication**: Email/password, OAuth (Google, Microsoft, GitHub), Phone/SMS, MFA
- **Firestore Database**: NoSQL document database with real-time sync
- **Cloud Storage**: File storage for documents, images, certificates
- **Cloud Functions**: Serverless backend logic
- **Security Rules**: Fine-grained access control
- **Analytics**: User behavior tracking
- **Performance Monitoring**: App performance insights
- **Crashlytics**: Error tracking

## Current Configuration

Your Firebase configuration (already integrated):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBTesMAShndQ1Xafo8FKfWy6vFDQ0MRYvI",
  authDomain: "signal-scout-483d5.firebaseapp.com",
  projectId: "signal-scout-483d5",
  storageBucket: "signal-scout-483d5.firebasestorage.app",
  messagingSenderId: "341229184373",
  appId: "1:341229184373:web:25341a5acb78b53c6a9f3c"
};
```

## Setup Steps

### 1. Enable Authentication Methods

Go to [Firebase Console](https://console.firebase.google.com/project/signal-scout-483d5/authentication/providers)

#### Email/Password Authentication
1. Click **Email/Password**
2. Enable **Email/Password**
3. Enable **Email link (passwordless sign-in)** (optional)
4. Save

#### Google OAuth
1. Click **Google**
2. Enable
3. Set project support email
4. Save

#### Microsoft OAuth
1. Click **Microsoft**
2. Enable
3. Add your Microsoft App credentials:
   - Go to [Azure Portal](https://portal.azure.com)
   - Register app
   - Copy Application (client) ID
   - Create client secret
   - Add redirect URI: `https://signal-scout-483d5.firebaseapp.com/__/auth/handler`
4. Save

#### Phone Authentication
1. Click **Phone**
2. Enable
3. Add test phone numbers for development (optional)
4. Set up App Verification:
   - Add your app's SHA-256 fingerprint (for Android)
   - Enable reCAPTCHA verification
5. Save

### 2. Create Firestore Database

Go to [Firestore Database](https://console.firebase.google.com/project/signal-scout-483d5/firestore)

1. Click **Create Database**
2. Select **Start in production mode**
3. Choose location closest to your users
4. Click **Enable**

#### Firestore Collections Structure

Create the following collections:

```
users/
├── {userId}/
│   ├── uid: string
│   ├── email: string
│   ├── firstName: string
│   ├── lastName: string
│   ├── fullName: string
│   ├── phone: string
│   ├── role: string (company|notary|bank|admin|super_admin)
│   ├── photoURL: string
│   ├── isEmailVerified: boolean
│   ├── isPhoneVerified: boolean
│   ├── isIdentityVerified: boolean
│   ├── isActive: boolean
│   ├── isApproved: boolean
│   ├── mfaEnabled: boolean
│   ├── faceEncoding: string
│   ├── aadhaarNumber: string
│   ├── panNumber: string
│   ├── passportNumber: string
│   ├── notaryLicenseNumber: string
│   ├── notaryLicenseState: string
│   ├── notaryLicenseExpiry: timestamp
│   ├── organizationName: string
│   ├── organizationId: string
│   ├── lastLoginAt: timestamp
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

companies/
├── {companyId}/
│   ├── ownerId: string
│   ├── companyName: string
│   ├── companyType: string
│   ├── registrationNumber: string
│   ├── taxId: string
│   ├── address: object
│   ├── email: string
│   ├── phone: string
│   ├── website: string
│   ├── directors: array
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

documents/
├── {documentId}/
│   ├── uploadedBy: string
│   ├── companyId: string
│   ├── documentType: string
│   ├── documentName: string
│   ├── documentNumber: string
│   ├── fileUrl: string
│   ├── fileSize: number
│   ├── mimeType: string
│   ├── status: string
│   ├── ocrText: string
│   ├── fraudScore: number
│   ├── isEncrypted: boolean
│   ├── isSigned: boolean
│   ├── qrCodeUrl: string
│   ├── uploadedAt: timestamp
│   ├── notarizedAt: timestamp
│   └── metadata: object

notaryRequests/
├── {requestId}/
│   ├── requestedBy: string
│   ├── companyId: string
│   ├── notaryId: string
│   ├── documentId: string
│   ├── requestNumber: string
│   ├── status: string
│   ├── identityVerified: boolean
│   ├── faceMatchScore: number
│   ├── livenessCheckPassed: boolean
│   ├── rejectionReason: string
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

notaryCertificates/
├── {certificateId}/
│   ├── notaryRequestId: string
│   ├── documentId: string
│   ├── notaryId: string
│   ├── issuedTo: string
│   ├── certificateNumber: string
│   ├── certificatePdfUrl: string
│   ├── qrCodeUrl: string
│   ├── digitalSignature: string
│   ├── issuedAt: timestamp
│   ├── expiresAt: timestamp
│   └── isRevoked: boolean

auditLogs/
├── {logId}/
│   ├── action: string
│   ├── userId: string
│   ├── resourceType: string
│   ├── resourceId: string
│   ├── ipAddress: string
│   ├── userAgent: string
│   ├── status: string
│   ├── metadata: object
│   └── createdAt: timestamp

notifications/
├── {notificationId}/
│   ├── userId: string
│   ├── type: string
│   ├── title: string
│   ├── message: string
│   ├── isRead: boolean
│   ├── createdAt: timestamp
│   └── expiresAt: timestamp
```

### 3. Configure Security Rules

#### Firestore Security Rules

Go to **Firestore Database** → **Rules** and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }
    
    function isNotary() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'notary';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isSignedIn();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Companies collection
    match /companies/{companyId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isOwner(resource.data.ownerId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Documents collection
    match /documents/{documentId} {
      allow read: if isSignedIn() && (
        isOwner(resource.data.uploadedBy) ||
        isAdmin() ||
        isNotary()
      );
      allow create: if isSignedIn();
      allow update: if isOwner(resource.data.uploadedBy) || isNotary() || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Notary requests collection
    match /notaryRequests/{requestId} {
      allow read: if isSignedIn() && (
        isOwner(resource.data.requestedBy) ||
        isOwner(resource.data.notaryId) ||
        isAdmin()
      );
      allow create: if isSignedIn();
      allow update: if isNotary() || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Notary certificates collection
    match /notaryCertificates/{certificateId} {
      allow read: if isSignedIn();
      allow create: if isNotary() || isAdmin();
      allow update: if isNotary() || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Audit logs collection (read-only for admins)
    match /auditLogs/{logId} {
      allow read: if isAdmin();
      allow write: if false; // Only Cloud Functions can write
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isSignedIn() && isOwner(resource.data.userId);
      allow update: if isSignedIn() && isOwner(resource.data.userId);
      allow create, delete: if false; // Only Cloud Functions can create/delete
    }
  }
}
```

### 4. Set Up Cloud Storage

Go to **Storage** → **Get Started**

1. Click **Get Started**
2. Start in **Production mode**
3. Choose same location as Firestore
4. Click **Done**

#### Create Storage Buckets

Create the following folder structure:
```
/documents/{userId}/
/avatars/{userId}/
/certificates/{certificateId}/
/temp/{userId}/
```

#### Storage Security Rules

Go to **Storage** → **Rules** and add:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Documents folder
    match /documents/{userId}/{allPaths=**} {
      allow read: if isSignedIn() && isOwner(userId);
      allow write: if isSignedIn() && isOwner(userId);
    }
    
    // Avatars folder (public read)
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if isSignedIn() && isOwner(userId);
    }
    
    // Certificates folder
    match /certificates/{certificateId}/{allPaths=**} {
      allow read: if isSignedIn();
      allow write: if false; // Only Cloud Functions can write
    }
    
    // Temp folder
    match /temp/{userId}/{allPaths=**} {
      allow read, write: if isSignedIn() && isOwner(userId);
    }
  }
}
```

### 5. Enable Multi-Factor Authentication (MFA)

1. Go to **Authentication** → **Sign-in method**
2. Click **Advanced** → **Multi-factor authentication**
3. Select **SMS** as second factor
4. Set enrollment to **Optional** or **Required**
5. Save

### 6. Configure Email Templates

1. Go to **Authentication** → **Templates**
2. Customize:
   - **Email address verification**
   - **Password reset**
   - **Email address change**
   - **SMS verification** (if using phone auth)

### 7. Set Up Indexes

Firestore will automatically suggest indexes when you query. Create them as needed.

Common indexes:
- `documents`: `uploadedBy` (ASC), `status` (ASC)
- `notaryRequests`: `status` (ASC), `createdAt` (DESC)
- `auditLogs`: `userId` (ASC), `createdAt` (DESC)

### 8. Environment Variables

Update your `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBTesMAShndQ1Xafo8FKfWy6vFDQ0MRYvI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=signal-scout-483d5.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=signal-scout-483d5
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=signal-scout-483d5.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=341229184373
NEXT_PUBLIC_FIREBASE_APP_ID=1:341229184373:web:25341a5acb78b53c6a9f3c
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
```

### 9. Backend Integration (Optional)

For backend verification of Firebase tokens:

```bash
pip install firebase-admin
```

Backend code:
```python
import firebase_admin
from firebase_admin import credentials, auth

# Initialize Firebase Admin
cred = credentials.Certificate("path/to/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

# Verify token
def verify_firebase_token(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        return None
```

### 10. Testing

Test authentication flows:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
firebase init

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

# Test locally with emulator
firebase emulators:start
```

## Features Enabled

✅ **Email/Password Authentication**
✅ **Google OAuth**
✅ **Microsoft OAuth**  
✅ **Phone/SMS Authentication**
✅ **Multi-Factor Authentication (MFA)**
✅ **Firestore Database**
✅ **Cloud Storage**
✅ **Security Rules**
✅ **Email Verification**
✅ **Password Reset**

## Frontend Integration

The frontend is already integrated with:

- `firebase.ts` - Firebase initialization
- `auth-service.ts` - Authentication service
- `useAuth.ts` - React hooks for auth state
- `AuthProvider` - Context provider

## Usage Examples

### Register
```typescript
import { authService } from '@/services/auth-service';

await authService.register({
  email: 'user@example.com',
  password: 'SecurePass123!',
  firstName: 'John',
  lastName: 'Doe',
  role: UserRole.COMPANY,
});
```

### Sign In
```typescript
await authService.signIn('user@example.com', 'password');
```

### OAuth
```typescript
await authService.signInWithGoogle();
await authService.signInWithMicrosoft();
```

### Use Auth Hook
```typescript
import { useAuth } from '@/hooks/useAuth';

function Component() {
  const { user, userProfile, loading, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return <div>Welcome {userProfile?.fullName}</div>;
}
```

## Security Best Practices

1. **Never commit** Firebase config with private keys
2. **Enable App Check** for production
3. **Set up budget alerts** to avoid unexpected charges
4. **Review security rules** regularly
5. **Enable audit logging**
6. **Use strong passwords** for admin accounts
7. **Implement rate limiting** on sensitive operations
8. **Enable 2FA** for Firebase Console access

## Monitoring

Enable monitoring in Firebase Console:
- **Performance Monitoring**: Track app performance
- **Crashlytics**: Monitor crashes and errors
- **Analytics**: Track user behavior
- **Cloud Logging**: View detailed logs

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Discord](https://discord.gg/firebase)

## Production Checklist

- [ ] Enable all required authentication methods
- [ ] Configure Firestore security rules
- [ ] Set up Cloud Storage with proper rules
- [ ] Enable MFA for critical accounts
- [ ] Set up email templates
- [ ] Configure budget alerts
- [ ] Enable Performance Monitoring
- [ ] Set up Crashlytics
- [ ] Enable App Check
- [ ] Review and test all security rules
- [ ] Set up proper indexes
- [ ] Enable backup (Firestore)
- [ ] Configure CORS for storage
- [ ] Set up custom domain (optional)
- [ ] Enable audit logging
