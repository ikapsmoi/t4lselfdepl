# Authentication & User Management Testing Checklist

## Manual Testing

### 1. Signup Flow
- [ ] **Basic Validation**
  - [ ] Empty fields show appropriate error messages
  - [ ] Invalid email format rejected
  - [ ] Password less than 8 characters rejected
  - [ ] Password without number/special char shows warning
  - [ ] Mismatched password confirmation rejected

- [ ] **Instagram ID Validation**
  - [ ] Leading @ symbol is automatically removed
  - [ ] Invalid characters (spaces, special chars except . and _) rejected
  - [ ] Handles over 40 characters rejected
  - [ ] Valid handles accepted (letters, numbers, dots, underscores)

- [ ] **City Search**
  - [ ] Typing triggers search after 400ms delay
  - [ ] Search results appear in dropdown
  - [ ] Selecting city populates form fields
  - [ ] Free text entry is rejected (must select from dropdown)
  - [ ] Rate limiting works (30 requests/minute)

- [ ] **Profile Creation**
  - [ ] Successful signup creates profile with all fields
  - [ ] Profile linked to auth.users.id correctly
  - [ ] Default avatar generated
  - [ ] Role assigned correctly (host/traveler)

- [ ] **Email Verification**
  - [ ] If confirmation required, verification modal appears
  - [ ] Resend verification button works
  - [ ] User cannot access authenticated features until verified

### 2. Login Flow
- [ ] **Basic Login**
  - [ ] Valid credentials allow login
  - [ ] Invalid credentials show generic error message
  - [ ] Email normalization works (case insensitive)

- [ ] **Email Verification Check**
  - [ ] Unverified users see verification reminder
  - [ ] Resend verification option available

- [ ] **Account Lockout**
  - [ ] After 5 failed attempts, account is locked
  - [ ] Lockout modal shows remaining time
  - [ ] Lockout expires after 15 minutes
  - [ ] Password reset option available during lockout

- [ ] **Auto Password Reset**
  - [ ] Incorrect password triggers automatic reset email
  - [ ] No email enumeration (same message for valid/invalid emails)

### 3. Password Reset Flow
- [ ] **Forgot Password**
  - [ ] Email field validation works
  - [ ] Reset email sent (check both valid and invalid emails)
  - [ ] Generic success message shown regardless of email validity

- [ ] **Reset Password**
  - [ ] Reset link from email works
  - [ ] Password strength validation enforced
  - [ ] Successful reset redirects to login
  - [ ] Reset event logged in audit table

### 4. Role-Based Access
- [ ] **Dashboard Routing**
  - [ ] Travelers routed to TravelerDashboard
  - [ ] Hosts routed to HostDashboard  
  - [ ] Admins routed to AdminDashboard
  - [ ] Unauthorized role access blocked

- [ ] **Feature Access**
  - [ ] Unauthenticated users see limited features
  - [ ] Role-specific features only available to correct roles
  - [ ] Server-side role validation enforced

### 5. Buddy Matching
- [ ] **Search Functionality**
  - [ ] Returns users in same state first
  - [ ] Excludes current user from results
  - [ ] Pagination works correctly
  - [ ] Compatibility scores calculated

- [ ] **Privacy Protection**
  - [ ] Only public profile fields returned
  - [ ] Private fields (email, instagram_id) not exposed
  - [ ] Authentication required for access

### 6. Security & RLS
- [ ] **Row Level Security**
  - [ ] Users can only read/update own profile
  - [ ] Public fields readable by authenticated users
  - [ ] Admin can read all profiles
  - [ ] Service role can manage profiles

- [ ] **Data Protection**
  - [ ] Service role keys not exposed to client
  - [ ] Sensitive operations server-side only
  - [ ] Input sanitization working

## Automated Testing

### Unit Tests
```typescript
// Example test structure
describe('Authentication', () => {
  describe('Signup', () => {
    it('should validate email format')
    it('should enforce password policy')
    it('should sanitize Instagram handle')
    it('should require city selection')
  })
  
  describe('Login', () => {
    it('should normalize email')
    it('should handle unverified email')
    it('should implement rate limiting')
  })
})
```

### Integration Tests
- [ ] **End-to-End Signup**
  - [ ] Complete signup flow with profile creation
  - [ ] Email verification process
  - [ ] Role-based dashboard redirect

- [ ] **End-to-End Login**
  - [ ] Login with verified account
  - [ ] Login with unverified account
  - [ ] Failed login handling

- [ ] **API Endpoints**
  - [ ] City search API rate limiting
  - [ ] Profile creation API validation
  - [ ] Password reset API security

## Performance Testing
- [ ] **City Search**
  - [ ] Debounce prevents excessive API calls
  - [ ] Cache reduces redundant requests
  - [ ] Fallback cities work when API fails

- [ ] **Database Queries**
  - [ ] Profile queries use proper indexes
  - [ ] Buddy match queries optimized
  - [ ] Audit table doesn't impact performance

## Security Testing
- [ ] **SQL Injection**
  - [ ] All user inputs properly parameterized
  - [ ] No raw SQL with user data

- [ ] **Authentication Bypass**
  - [ ] Cannot access protected routes without auth
  - [ ] Cannot access other users' data
  - [ ] Role escalation prevented

- [ ] **Rate Limiting**
  - [ ] City search rate limited per IP
  - [ ] Login attempts rate limited per email
  - [ ] Password reset rate limited

## Monitoring & Logging
- [ ] **Audit Events**
  - [ ] Signup events logged
  - [ ] Login attempts logged (success/failure)
  - [ ] Password reset requests logged
  - [ ] Email verification resends logged

- [ ] **Error Tracking**
  - [ ] Authentication errors captured
  - [ ] API failures logged
  - [ ] Performance issues monitored

## Production Readiness
- [ ] **Environment Variables**
  - [ ] All secrets properly configured
  - [ ] Service role key secured
  - [ ] API endpoints configured

- [ ] **Database**
  - [ ] Migrations applied successfully
  - [ ] Indexes created for performance
  - [ ] RLS policies active

- [ ] **Edge Functions**
  - [ ] All functions deployed
  - [ ] CORS headers configured
  - [ ] Error handling implemented