# NotaryChain

NotaryChain is an enterprise-grade platform for secure document notarization, verification, and fraud detection.

## Authentication System (Firebase Authentication)

NotaryChain uses **Firebase Authentication** as its single, unified authentication provider with **Firebase Admin SDK** for server-side token verification on FastAPI.

### Authentication Features Supported
- ✅ **Email & Password Authentication** (Strong password rules & Strength meter)
- ✅ **Email Verification Required**
- ✅ **Password Reset Flow**
- ✅ **Google Sign-In**
- ✅ **Microsoft OAuth Sign-In**
- ✅ **Phone Number Authentication (SMS OTP)**
- ✅ **Firebase Multi-Factor Authentication (MFA / 2FA)**
- ✅ **Session Persistence & Automatic Token Refresh**
- ✅ **Brute-Force Attack Lockout Protection**
- ✅ **Secure Logout Everywhere (Refresh Token Revocation)**
- ✅ **Role-Based Access Control (RBAC)** via Firebase Custom Claims & FastAPI dependencies

---

## Project Authentication Structure

```text
frontend/
  src/
    lib/
      firebase.ts             # Client Firebase initialization & RecaptchaVerifier factory
    context/
      AuthContext.tsx         # Global AuthProvider, token auto-refresh & MFA resolver
    hooks/
      useAuth.tsx             # Auth context hooks (useAuth, useRequireAuth, useRequireRole)
    middleware.ts             # Next.js Edge Middleware for route protection
    components/
      auth/
        LoginForm.tsx         # Dark glassmorphic login form with 2FA resolver
        RegisterForm.tsx      # Registration form with password strength meter
        ForgotPassword.tsx    # Password reset email form
        VerifyEmail.tsx       # Email verification pending & resend component
        PhoneVerification.tsx # Phone number & 6-digit OTP verification
        MFASetup.tsx          # Step-by-step SMS 2FA enrollment & management
        ProtectedRoute.tsx    # Route guard component with loading spinner
    app/
      login/page.tsx
      register/page.tsx
      forgot-password/page.tsx
      verify-email/page.tsx
      mfa-setup/page.tsx
      phone-verification/page.tsx

backend/
  app/
    core/
      firebase.py             # Firebase Admin SDK initialization & token verification
    middleware/
      auth.py                 # FastAPI Bearer HTTPBearer token verification & RBAC guard
    api/
      v1/
        auth.py               # User sync, /auth/me, and /auth/logout-everywhere
```

---

## Setup & Configuration

### 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create/select your project.
2. **Enable Authentication Methods**:
   - Go to **Authentication > Sign-in method**.
   - Enable **Email/Password**.
   - Enable **Google** (Configure OAuth consent screen).
   - Enable **Microsoft** (Set Client ID & Secret from Azure Portal).
   - Enable **Phone** (Add test phone numbers for local development if needed).
3. **Enable Multi-Factor Authentication (MFA)**:
   - Go to **Authentication > Settings > Multi-factor authentication**.
   - Enable **SMS Multi-Factor Authentication**.
4. **Service Account Credentials (Backend)**:
   - Go to **Project Settings > Service accounts**.
   - Click **Generate new private key** to download the JSON.

---

### 2. Environment Variables Configuration

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=NotaryChain
```

#### Backend (`.env`)
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## Authentication Workflows

### Login & MFA Flow
1. User enters Email/Password or clicks Google/Microsoft login.
2. Firebase verifies primary credential.
3. If user has MFA enabled, Firebase throws `auth/multi-factor-auth-required` with a `resolver`.
4. The `LoginForm` catches the error, renders the 2FA OTP prompt, and sends SMS code to registered phone.
5. User inputs 6-digit OTP to complete authentication.

### Route Protection
- **Guest Routes**: `/login`, `/register`, `/forgot-password` (Redirect authenticated users to `/dashboard`).
- **Authenticated Routes**: `/dashboard`, `/profile`, `/settings`, `/mfa-setup`, `/phone-verification` (Redirect unauthenticated users to `/login`).
- **Admin Routes**: `/admin` (Protected by `require_role('admin', 'super_admin')`).

### Backend Token Verification
All protected FastAPI routes verify the client's Firebase ID Token sent via HTTP Authorization header:
```text
Authorization: Bearer <Firebase_ID_Token>
```
Backend verifies tokens using `firebase_admin.auth.verify_id_token(id_token, check_revoked=True)`.

---

## Local Development Setup

### 1. Install Backend Dependencies & Start Server
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Install Frontend Dependencies & Start Next.js
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to access the application.
