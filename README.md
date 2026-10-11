# Travel4life - Adventure Awaits

A modern travel platform connecting adventurous travelers with verified hosts for unforgettable group experiences.

## 🌟 Features

- **Group Travel Experiences**: Join small groups of like-minded travelers
- **Verified Hosts**: All hosts are background-checked and verified
- **Safety Tools**: GPS tracking, buddy matching, and emergency contacts
- **Creator Trips**: Exclusive adventures with verified influencers
- **India Specials**: Authentic cultural experiences across India
- **VR Previews**: 360° trip previews before booking
- **NFT Souvenirs**: Digital collectibles from your adventures
- **Loyalty Program**: Earn points and unlock exclusive perks

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Netlify/Bolt Hosting

## 🎨 Design System

### Brand Colors
- **Navy**: `#0F2F6B` - Primary brand color
- **Aqua**: `#47B5C4` - Secondary brand color
- **Forest**: `#3E6A4F` - Nature accent
- **Charcoal**: `#1E1E1E` - Text primary
- **Slate**: `#5B6673` - Text secondary

### Typography
- **Headings**: Montserrat
- **Body**: Lato

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Admin access

Set `VITE_ADMIN_PASSWORD` in the local `.env.local` file or the deployment environment to enable the password gate for admin routes. The footer's Admin link opens this gate. The trips manager additionally requires a signed-in Supabase account whose `profiles.role` is `admin`; apply `supabase/migrations/20261006113000_admin_trip_management_policies.sql` to grant that role read/update access to every trip through RLS. The Vite password gate is client-side convenience only—`VITE_` variables are embedded in the browser bundle and are not secure authorization.

## SEO War Room

The admin dashboard's SEO War Room imports Search Console query, page, and search-appearance CSV exports into admin-only Supabase tables. Apply `supabase/migrations/20261006123800_seo_growth_command_center.sql` after the admin trip-management migration; it depends on the shared `public.is_travel4life_admin()` policy helper. The War Room requires a signed-in Supabase admin profile and the existing Supabase environment configuration. Upload each export as its own dimension and set the report dates when known. Imported query ownership, page-readiness assessments, and SEO change notes stay private behind Supabase RLS; the raw query data is not added to public assets.

The command center distinguishes measured Search Console rows from planned query hypotheses. Its CTR opportunity score is an internal prioritization heuristic, not a ranking forecast. The supplied page-readiness dimension weights add up to 95 points (although its label bands are written on a 100-point scale); the War Room preserves those exact weights and labels the scoring scale rather than silently changing the rubric. Search Console dimensions can have different totals and privacy-threshold omissions, so do not combine query, page, and chart totals as a single baseline. See [SEO_IMPLEMENTATION.md](./docs/SEO_IMPLEMENTATION.md) for the observed-export caveat, editorial ownership, and validation commands.

## 📱 Features Overview

### For Travelers
- Browse and book unique group adventures
- Connect with like-minded travelers
- Safety tools and emergency support
- Loyalty rewards and achievements
- Digital trip souvenirs (NFTs)

### For Hosts
- Create and manage trip experiences
- Verified host program
- Earnings dashboard
- Traveler communication tools

### For Creators
- Exclusive creator trip program
- Social media integration
- Verified creator badges
- Revenue sharing

## 🌍 Destinations

Travel4life offers experiences across 45+ countries with special focus on:
- **Iceland**: Northern Lights and glacier adventures
- **India**: Cultural immersion and spiritual journeys
- **Japan**: Traditional and modern cultural experiences
- **Morocco**: Desert adventures and cultural exploration
- **Costa Rica**: Wildlife and eco-adventures
- **Patagonia**: Trekking and wilderness experiences

## 🔒 Safety & Trust

- Background-checked hosts
- 24/7 emergency support
- GPS tracking for active trips
- Buddy matching system
- Comprehensive travel insurance
- Community reviews and ratings

## 📞 Contact

- **Email**: info@travel4life.com
- **Phone**: +91 (9871) 621-921
- **Location**: San Francisco, CA

## 📄 License

This project is proprietary software. All rights reserved.

---

**Travel4life** - Where adventure meets community. 🌟