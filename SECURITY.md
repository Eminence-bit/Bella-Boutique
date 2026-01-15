# Security Policy

## Security Measures Implemented

### Authentication & Authorization
- **PKCE Flow**: Using Proof Key for Code Exchange for enhanced OAuth security
- **Role-Based Access Control**: Admin privileges must be assigned manually via database
- **Session Management**: Automatic token refresh with secure session persistence
- **Rate Limiting**: Client-side rate limiting on login attempts (2-second cooldown)
- **Password Requirements**: Minimum 8 characters enforced

### Input Validation & Sanitization
- **Email Validation**: Regex-based email format validation
- **Search Query Limits**: Maximum 100 characters to prevent DoS attacks
- **Input Length Limits**: All form inputs have maxLength constraints
- **XSS Prevention**: Sanitization of user inputs in WhatsApp messages

### Environment Security
- **Private Package**: Package.json set to private to prevent accidental publishing
- **Environment Variables**: Sensitive data stored in .env files (not committed)
- **Development-Only Logging**: Console logs only in development mode
- **No Hardcoded Secrets**: All sensitive values use environment variables

### HTTP Security Headers
- **X-Content-Type-Options**: nosniff - Prevents MIME type sniffing
- **X-Frame-Options**: DENY - Prevents clickjacking attacks
- **X-XSS-Protection**: Enabled with blocking mode

### Performance & Security
- **Code Splitting**: Vendor chunks separated to reduce bundle size
- **Lazy Loading**: Images loaded on-demand with proper error handling
- **Memory Leak Prevention**: Proper cleanup of subscriptions and listeners
- **Image Fallbacks**: Error handling for broken image URLs

## Environment Variables Required

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_WHATSAPP_NUMBER=your_whatsapp_number
```

## Database Security (Supabase)

### Row Level Security (RLS) Policies Required

#### Products Table
```sql
-- Public read access
CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

-- Admin-only write access
CREATE POLICY "Allow admin insert" ON products
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Allow admin update" ON products
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Allow admin delete" ON products
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );
```

#### Profiles Table
```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Only authenticated users can insert their profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );
```

## Reporting Security Issues

If you discover a security vulnerability, please email: [security contact email]

**Do not** create public GitHub issues for security vulnerabilities.

## Security Best Practices for Deployment

1. **Enable HTTPS**: Always use HTTPS in production
2. **Configure CSP**: Add Content Security Policy headers
3. **Enable CORS**: Configure proper CORS policies
4. **Regular Updates**: Keep dependencies updated
5. **Monitor Logs**: Set up logging and monitoring
6. **Backup Data**: Regular database backups
7. **API Rate Limiting**: Implement server-side rate limiting
8. **DDoS Protection**: Use CDN with DDoS protection

## Recommended Supabase Settings

- Enable email confirmation for new signups
- Configure password strength requirements
- Set up email rate limiting
- Enable audit logging
- Configure session timeout
- Enable MFA for admin accounts

## Security Checklist

- [x] Environment variables properly configured
- [x] No secrets in code
- [x] Input validation on all forms
- [x] XSS prevention measures
- [x] CSRF protection via Supabase
- [x] Secure session management
- [x] Role-based access control
- [x] Security headers configured
- [ ] SSL/TLS certificate installed (production)
- [ ] Regular security audits scheduled
- [ ] Dependency vulnerability scanning enabled
- [ ] Backup and recovery plan documented
