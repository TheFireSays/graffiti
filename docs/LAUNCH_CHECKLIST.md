# Graffiti — Production Launch Checklist

## 1. Domain & Hosting

- [ ] **Purchase domain** — `graffiti.app` (or alternative)
  - Registrar: Namecheap, Google Domains, Cloudflare
  - ~$15-40/year depending on TLD
- [ ] **DNS setup** — point domain to your web hosting / landing page
- [ ] **SSL certificate** — auto via Cloudflare or hosting provider
- [ ] **Update `APP_BASE_URL`** in `src/components/crew/crew-invites.tsx` from `https://graffiti.app` to your actual domain
- [ ] **Update deep link config** in `app.json` — `associatedDomains` and `intentFilters` to match your domain

---

## 2. Supabase (Backend)

- [ ] **Supabase Pro plan** ($25/mo) — required for production workloads
  - Free tier: 500MB database, 1GB storage, 2GB bandwidth
  - Pro tier: 8GB database, 100GB storage, 250GB bandwidth
- [ ] **Run all migrations** against production database (`supabase db push`)
- [ ] **Enable pg_cron** for crew inactivity dissolution (requires Supabase Pro)
- [ ] **Set environment variables** in Supabase dashboard:
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
  - `APPLE_CLIENT_ID` / `APPLE_CLIENT_SECRET`
  - `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET`
- [ ] **Production `.env`** — update with production Supabase URL and anon key
- [ ] **Rotate service role key** if it was ever exposed in git history

---

## 3. Email Service

- [ ] **Sign up for email service** (pick one):
  | Service | Free Tier | Paid | Recommendation |
  |---------|-----------|------|----------------|
  | Resend | 3,000/mo | $20/mo for 50k | Best for startups |
  | Postmark | 100/mo | $15/mo for 10k | Best deliverability |
  | SendGrid | 100/day | $20/mo for 50k | Most popular |
  | AWS SES | 3,000/mo | ~$0.10/1k | Cheapest at scale |
- [ ] **Get SMTP credentials** from chosen provider
- [ ] **Configure in Supabase dashboard** → Auth → SMTP Settings:
  - SMTP host, port, username, password
  - Sender email (e.g., `noreply@graffiti.app`)
  - Sender name: "Graffiti"
- [ ] **Set up DNS records** for email deliverability:
  - SPF record
  - DKIM record
  - DMARC record
- [ ] **Customize email templates** in Supabase dashboard:
  - Signup confirmation email
  - Password reset email
  - Email change confirmation
- [ ] **Test email delivery** — verify emails don't land in spam

---

## 4. OAuth / Social Login Credentials

### Google OAuth
- [ ] **Google Cloud Console** → Create project → APIs & Services → OAuth consent screen
  - https://console.cloud.google.com/
  - Free (part of Google Cloud free tier)
- [ ] **Create OAuth 2.0 Client ID** (Web application type)
- [ ] **Add authorized redirect URI**: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
- [ ] **Copy Client ID and Client Secret** → Supabase Auth settings

### Apple Sign-In
- [ ] **Apple Developer account** ($99/year) — required anyway for iOS App Store
  - https://developer.apple.com/
- [ ] **Register App ID** with Sign In with Apple capability
- [ ] **Create Services ID** for web-based Apple Sign-In
- [ ] **Create private key** for Sign In with Apple
- [ ] **Copy credentials** → Supabase Auth settings

### Facebook Login
- [ ] **Facebook Developer account** (free)
  - https://developers.facebook.com/
- [ ] **Create Facebook App** → Add Facebook Login product
- [ ] **Set Valid OAuth Redirect URI**: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
- [ ] **Copy App ID and App Secret** → Supabase Auth settings

---

## 5. App Store Registration

### Apple App Store (iOS)
- [ ] **Apple Developer Program** — $99/year
  - https://developer.apple.com/programs/
- [ ] **Create App Store Connect listing**
  - App name: "Graffiti"
  - Bundle ID: `com.graffiti.app`
  - Primary category: Games → Casual (or Social Networking)
  - Secondary category: Entertainment
- [ ] **Prepare store assets:**
  - App icon: 1024x1024 PNG (no transparency, no rounded corners)
  - Screenshots: iPhone 6.7" (1290x2796), iPhone 6.5" (1284x2778), iPad 12.9" (2048x2732)
  - App preview video (optional but recommended, 15-30 seconds)
- [ ] **Write store listing:**
  - App name (30 chars max)
  - Subtitle (30 chars max)
  - Description (4000 chars max)
  - Keywords (100 chars max, comma-separated)
  - What's New text
- [ ] **Privacy Policy URL** — required (host on your domain)
- [ ] **Terms of Service URL** — recommended
- [ ] **App Review information** — demo account credentials for Apple reviewers
- [ ] **Age rating** — complete the questionnaire (likely 12+ due to user-generated content)
- [ ] **Export compliance** — declare encryption usage (yes, HTTPS/TLS)
- [ ] **Content rights** — declare you own or have rights to all content

### Google Play Store (Android)
- [ ] **Google Play Console** — $25 one-time fee
  - https://play.google.com/console/
- [ ] **Create app listing**
  - App name: "Graffiti"
  - Package name: `com.graffiti.app`
  - Category: Games → Casual (or Social)
  - Content rating: complete IARC questionnaire
- [ ] **Prepare store assets:**
  - App icon: 512x512 PNG
  - Feature graphic: 1024x500 PNG
  - Screenshots: phone (min 2), tablet (optional), 16:9 or 9:16 ratio
  - Short description (80 chars)
  - Full description (4000 chars)
- [ ] **Privacy Policy URL** — required
- [ ] **Data safety form** — declare what data is collected (location, email, profile)
- [ ] **Target audience** — declare age group
- [ ] **Ads declaration** — no ads (or declare if you plan to add them)
- [ ] **Set up closed testing track** first (required before production)
- [ ] **20 testers for 14 days** — Google requires closed testing before open launch

---

## 6. Error Monitoring

- [ ] **Sentry account** (free tier: 5k events/month)
  - https://sentry.io/
- [ ] **Create Sentry project** (React Native)
- [ ] **Get DSN** → set `EXPO_PUBLIC_SENTRY_DSN` in production env
- [ ] **Configure source maps** for readable stack traces in production

---

## 7. Push Notifications

- [ ] **Firebase Cloud Messaging (FCM)** for Android — free
  - https://console.firebase.google.com/
  - Create project → Add Android app → Download `google-services.json`
  - Get FCM server key → Supabase Push Notifications settings
- [ ] **Apple Push Notification Service (APNs)** for iOS
  - Apple Developer portal → Keys → Create APNs key
  - Download `.p8` key file → Supabase Push Notifications settings
- [ ] **Test push notifications** on both platforms

---

## 8. EAS Build & Deployment

- [ ] **Expo account** (free tier available)
  - https://expo.dev/
- [ ] **Install EAS CLI**: `sudo npm install -g eas-cli`
- [ ] **Configure signing:**
  - iOS: provisioning profile + distribution certificate (EAS can manage these)
  - Android: upload keystore or let EAS generate one
- [ ] **Build production binaries:**
  ```bash
  eas build --platform ios --profile production
  eas build --platform android --profile production
  ```
- [ ] **Submit to stores:**
  ```bash
  eas submit --platform ios
  eas submit --platform android
  ```

---

## 9. Analytics (Optional but Recommended)

- [ ] **Choose analytics provider:**
  | Service | Free Tier | Notes |
  |---------|-----------|-------|
  | PostHog | 1M events/mo | Open source, product analytics |
  | Mixpanel | 20M events/mo | Event-based analytics |
  | Amplitude | 10M events/mo | Product analytics |
  | Google Analytics (Firebase) | Unlimited | Basic, free forever |
- [ ] **Integrate SDK** and track key events (signup, tag placed, zone flipped, crew joined)

---

## 10. Content Moderation (Scale Consideration)

- [ ] **Review queue** — admin dashboard for reported tags (basic moderation RPCs exist)
- [ ] **Consider automated moderation** at scale:
  | Service | Free Tier | Notes |
  |---------|-----------|-------|
  | Google Cloud Vision | 1k/mo | Image content moderation |
  | AWS Rekognition | 5k/mo | Image analysis |
  | Hive Moderation | Contact | Purpose-built for UGC |
- [ ] **Community guidelines** — write and publish on your domain

---

## 11. Legal

- [ ] **Privacy Policy** — required for both app stores
  - Must disclose: location data collection, email, username, analytics
  - Host at `https://graffiti.app/privacy`
  - Free generators: Termly, iubenda, or write custom
- [ ] **Terms of Service** — recommended
  - Host at `https://graffiti.app/terms`
  - Cover: user conduct, content ownership, account termination
- [ ] **GDPR compliance** (if serving EU users):
  - Data export functionality
  - Account deletion (already implemented via `delete_account` RPC)
  - Cookie consent (web only)
- [ ] **CCPA compliance** (if serving California users):
  - "Do Not Sell My Personal Information" option
- [ ] **COPPA compliance** — if under-13 users possible, need parental consent

---

## 12. Pre-Launch Testing

- [ ] **Device testing** — test on 3+ physical devices (iOS + Android)
- [ ] **Performance profiling** — check for memory leaks, slow renders
- [ ] **Offline behavior** — verify offline queue works, data syncs on reconnect
- [ ] **Deep link testing** — verify `graffiti://` scheme and universal links work
- [ ] **Push notification testing** — verify delivery on both platforms
- [ ] **Auth flow E2E** — sign up → verify email → onboarding → main app
- [ ] **Social login E2E** — Google, Apple, Facebook all complete the flow
- [ ] **Load testing** — simulate concurrent tag placements, zone control flips
- [ ] **Security audit** — penetration test RPC endpoints, verify RLS policies

---

## 13. Cost Summary (Estimated Monthly at Launch)

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| Supabase | Pro | $25 |
| Domain | .app TLD | ~$2 |
| Email (Resend) | Free tier | $0 |
| Sentry | Free tier | $0 |
| Firebase (FCM) | Free | $0 |
| Expo/EAS | Free tier | $0 |
| Apple Developer | Annual | ~$8/mo ($99/yr) |
| Google Play | One-time | $0 (after $25 fee) |
| **Total** | | **~$35/mo + one-time fees** |

Scales up as usage grows — Supabase Pro handles ~100k MAU before needing Team plan ($599/mo).

---

## 14. Launch Day

- [ ] **Flip `DEMO_MODE` off** for production builds
- [ ] **Final migration push** to production Supabase
- [ ] **Submit iOS build** to App Store review (allow 1-3 days)
- [ ] **Submit Android build** to Play Store review (allow 1-7 days)
- [ ] **Prepare landing page** at your domain
- [ ] **Social media accounts** — Instagram, TikTok, X (graffiti/street art community)
- [ ] **Launch announcement** — target local communities first (Austin as pilot market)
