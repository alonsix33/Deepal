# 🚗⚡ DEEPAL S05 REEV TRACKER - PWA PROJECT BRIEF

## 📋 EXECUTIVE SUMMARY

Build a Progressive Web App (PWA) to track consumption, costs, and maintenance for a **Deepal S05 REEV (Range Extended Electric Vehicle)** purchased in Lima, Peru. The app should mirror the aesthetic of the Deepal S05's infotainment system (Deepal OS 3.0) and include a 3D model of the vehicle.

---

## 🎯 PROJECT CONTEXT

### Vehicle Details
- **Model:** Deepal S05 REEV (2026)
- **Color:** Black (Eclipse Black)
- **Owner:** Alonso (22, Lima, Peru)
- **Purchase Date:** January 2026
- **Location:** Benavides, Surco, Lima
- **Vendor:** Derco Center Surco (Diego Méndez)

### Technical Specifications
**Powertrain:**
- **Type:** REEV (Range Extended Electric Vehicle)
- **Electric Motor:** 214 HP (160 kW), 320 Nm torque
- **Gasoline Generator:** 1.5L 4-cylinder, 96 HP (only generates electricity, never drives wheels)
- **Battery:** 27.28 kWh LFP (Lithium Iron Phosphate) - CATL
- **Electric Range:** ~125 km real-world (158 km NEDC)
- **Total Range:** 1,129 km (with gasoline generator)
- **Acceleration:** 0-100 km/h in 7.9s
- **Drive:** RWD (Rear Wheel Drive)

**Charging:**
- **AC Charging:** 7 kW (Type 2 connector)
  - 0-100%: ~3.9 hours
  - 20-80%: ~2.3 hours
- **DC Fast Charging:** 54.5 kW (CCS2 connector)
  - 30-80%: ~20 minutes
  - 0-80%: ~30-35 minutes

**Fuel Tank:** 45-51 liters (varies by source)

**Infotainment:**
- **System:** Deepal OS 3.0 (Huawei-based)
- **Chip:** Qualcomm Snapdragon 8155P (16GB RAM, 128GB storage)
- **Screen:** 15.4" 2.5K touchscreen ("Sunflower" - rotates toward driver)
- **HUD:** AR Head-Up Display (53" equivalent projection)
- **Audio:** 8-speaker system (14-speaker in higher trims)
- **Design Language:** Minimalist, spacecraft-inspired, dark theme, mostly touchscreen controls

**Maintenance Schedule:**
| Kilometer | Service Type | Est. Cost (S/) |
|-----------|--------------|----------------|
| 5,000 | 1st Service | 250-350 |
| 15,000 | 2nd Service | 300-400 |
| 25,000 | 3rd Service | 350-450 |
| 40,000 | Major Service | 600-800 |

**Warranty:**
- Vehicle: 5 years or 120,000 km
- Battery/High Voltage System: 8 years or 150,000 km

---

## 📊 USER USAGE PATTERNS

### Weekly Routes
**Weekday Routes (3x/week):**
- Home (Benavides, Surco) ↔ Barranco (Jr. Martínez de Pinillos)
- Distance: 5.9 km one-way (11.8 km round trip)
- Total: ~35 km/week

**Weekend Routes:**
- Home → La Molina (Óvalo de la Fontana) + picking up friends
- Distance: ~28 km per outing
- Frequency: 1-2x/week
- Total: ~42 km/week

**Monthly Totals:**
- **Estimated:** 450 km/month (~5,400 km/year)
- **Primary Mode:** 100% electric (rarely uses gasoline)
- **Charging Frequency:** 1x/week (Saturday/Sunday nights)
- **Charging Location Mix:** 50% home, 50% free public chargers (malls)

### Electricity Costs (Lima - Luz del Sur)
- **Residential Rate:** S/ 0.73/kWh (for consumption >140 kWh/month)
- **Cost per Full Charge:** S/ 19.91 (27.28 kWh)
- **Cost per km:** S/ 0.177/km (electric only)
- **Monthly Electric Cost:** S/ 40-80 (depending on charging location)

### Public Charging Locations (Lima)
- **Jockey Plaza:** DC Fast (50kW+) - FREE
- **Larcomar:** AC 22kW - FREE
- **Real Plaza Salaverry:** AC 7kW - FREE
- **Operators:** Voltex, Enel X, Voltrelli, EVInka

---

## 🎨 DESIGN REQUIREMENTS

### Visual Style: Deepal OS 3.0 Inspired
**Core Aesthetic:**
- **Color Scheme:** 
  - Primary: Deep blacks (#0A0A0A, #121212)
  - Accent: Electric blues (#00D4FF, #0095FF) 
  - Secondary: Silvers/grays (#8A8A8A, #C0C0C0)
  - Warning: Amber (#FFA500)
  - Success: Cyan/teal (#00CED1)
- **Typography:** 
  - Sans-serif, futuristic (Orbitron, Exo 2, or similar)
  - Weights: Light (100-300) for data, Bold (600-800) for headers
- **Layout:**
  - Minimalist, card-based
  - Large touch targets (mobile-first)
  - Glassmorphism effects (frosted glass cards)
  - Subtle gradients and glows
  - Animated transitions (smooth, not jarring)
- **Iconography:**
  - Outline style, minimal
  - Animated on interaction
  - Spacecraft/tech-inspired

**Reference Materials:**
- Deepal OS 3.0 uses Huawei HarmonyOS-inspired design
- 15.4" touchscreen interface with rotatable "Sunflower" mechanism
- AR-HUD aesthetic (holographic, futuristic data displays)
- Spacecraft cockpit inspiration
- Winner of 2025 iF Design Award

### 3D Model Integration
**Vehicle Model:**
- **Target:** Deepal S05 3D model (GLB/GLTF format)
- **Sources to explore:**
  1. Sketchfab (search "Deepal S05", "Changan S05", or similar Chinese EVs)
  2. Free3D, CGTrader, TurboSquid
  3. If unavailable: Use similar modern SUV model and customize
  4. Last resort: Create simplified model or use 2D illustrations

**3D Implementation:**
- **Library:** Three.js via @react-three/fiber + @react-three/drei
- **Features:**
  - Interactive rotation (drag to rotate)
  - Tap/click on different parts for details
  - Lighting: Ambient + directional (spotlight effect)
  - Background: Dark with subtle gradient
  - Position: Centered, slight angle to show dimensions
  - Scale: Responsive to screen size
- **Use Cases:**
  - Home screen hero
  - Vehicle info page
  - Service history visualization (highlight service areas)

---

## 🛠️ TECHNICAL STACK

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **3D Graphics:** Three.js (@react-three/fiber + @react-three/drei)
- **Charts:** Recharts or Chart.js
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **PWA:** next-pwa

### Backend
- **Platform:** Railway
- **Framework:** Express.js or Next.js API Routes
- **Database:** PostgreSQL (via Railway)
- **ORM:** Prisma
- **Auth:** NextAuth.js (optional for multi-user)

### Deployment
- **Frontend:** Vercel
- **Backend:** Railway
- **Domain:** TBD

### Key Libraries
```json
{
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.92.0",
  "three": "^0.160.0",
  "framer-motion": "^11.0.0",
  "recharts": "^2.10.0",
  "next-pwa": "^5.6.0",
  "prisma": "^5.8.0",
  "@prisma/client": "^5.8.0",
  "tailwindcss": "^3.4.0",
  "shadcn/ui": "latest"
}
```

---

## 📱 FEATURE REQUIREMENTS

### 1. Dashboard (Home)
**Hero Section:**
- 3D model of Deepal S05 (rotatable)
- Current battery level (circular progress indicator)
- Estimated range remaining (km)
- Quick stats: Total km driven, % electric vs gas this month

**Key Metrics Cards:**
- Monthly cost (S/)
- Cost per km (S/)
- % Electric usage
- Next service due (km remaining)

**Recent Activity:**
- Last 5 charges/fuel-ups (scrollable list)
- Mini chart of last 7 days consumption

### 2. Charging Log
**Add Charge Entry:**
- Date/time (auto-fill current)
- Location (home, mall name, or custom)
- Charge type: AC 7kW, AC 22kW, DC 50kW+
- Starting km (odometer)
- Ending km (optional, for tracking)
- kWh charged (manual input or calculate from battery %)
- Cost (S/) - if charged at home
- Duration (optional)

**Charging History:**
- Filterable list (date range, location, type)
- Stats: Total kWh charged, total cost, avg cost per charge
- Chart: kWh charged over time
- Export to CSV

### 3. Fuel Log (Gasoline)
**Add Fuel Entry:**
- Date/time
- Km (odometer)
- Liters
- Cost (S/)
- Cost per liter (S/L)
- Location/gas station (optional)
- Notes (e.g., "Road trip to Paracas")

**Fuel History:**
- Filterable list
- Stats: Total liters, total cost, avg L/100km when using gas
- Chart: Fuel consumption over time
- Rare event indicator (since mostly electric)

### 4. Maintenance Tracker
**Service Records:**
- Date
- Km (odometer)
- Service type (dropdown: Oil change, brake service, tire rotation, major service, etc.)
- Cost (S/)
- Service provider (Derco, other)
- Notes/details
- Upload receipt photo (optional)

**Service Reminders:**
- Next oil change: X km remaining
- Next major service: X km remaining
- Battery health check: Date-based
- Push notifications (PWA)

**Service History:**
- Timeline view
- Filter by type
- Total maintenance costs
- Cost per km for maintenance

### 5. Trip Logger (Optional)
**Trip Entry:**
- Start km / End km
- Distance
- Purpose (work, personal, weekend)
- Mode (electric, REEV, mixed)
- Notes

**Trip Stats:**
- Weekly/monthly distance
- % work vs personal
- Most common routes

### 6. Analytics Dashboard
**Cost Analysis:**
- Monthly cost breakdown (electric vs gas vs maintenance)
- Cost per km trend (line chart)
- Comparison: Actual costs vs equivalent gasoline car
- YTD savings

**Usage Patterns:**
- % Electric vs gas usage (pie chart)
- kWh charged per month (bar chart)
- Km driven per month (line chart)
- Charging location breakdown (home vs public)

**Efficiency Metrics:**
- kWh/100km (electric efficiency)
- L/100km (when using gas)
- Regenerative braking stats (if trackable)

### 7. Vehicle Info
**Specifications Page:**
- Display all technical specs
- Owner info (VIN, purchase date, vendor)
- Warranty info (expiry dates)
- Insurance details (provider, policy number, expiry)
- SOAT info

**3D Model Viewer:**
- Full-screen mode
- Rotate, zoom
- Click parts for info (e.g., click battery → battery specs)

### 8. Settings
**User Preferences:**
- Currency (S/ default)
- Units (km, kWh default)
- Language (Spanish, English)
- Theme (dark mode only initially, light mode later)
- Notifications (enable/disable, frequency)

**Data Management:**
- Export all data (JSON, CSV)
- Import data (CSV)
- Backup to cloud (optional)
- Reset all data (with confirmation)

**App Info:**
- Version
- Credits
- Open source licenses
- Feedback form

---

## 🎯 USER STORIES

**As Alonso, I want to:**
1. **Track every charge** so I know my monthly electricity costs
2. **See at a glance** whether I'm mostly driving electric or using gas
3. **Get reminded** when my next service is due (every 10,000 km)
4. **Compare costs** vs a traditional gasoline car to justify my purchase
5. **Show off a cool 3D model** of my car to friends
6. **Access the app offline** (PWA) even in underground parking
7. **Export my data** if I want to analyze in Excel
8. **Use the app on both my phone and computer** (responsive)

---

## 📐 DATABASE SCHEMA (Prisma)

```prisma
model Vehicle {
  id              String   @id @default(cuid())
  make            String   // "Deepal"
  model           String   // "S05"
  year            Int      // 2026
  trim            String   // "REEV"
  color           String   // "Black"
  vin             String?  @unique
  purchaseDate    DateTime
  purchasePrice   Float    // USD or PEN
  odometerStart   Int      // Starting km
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  charges         Charge[]
  fuelUps         FuelUp[]
  services        Service[]
  trips           Trip[]
}

model Charge {
  id              String   @id @default(cuid())
  vehicleId       String
  vehicle         Vehicle  @relation(fields: [vehicleId], references: [id])
  
  date            DateTime
  location        String   // "Home", "Jockey Plaza", etc.
  chargeType      String   // "AC_7kW", "AC_22kW", "DC_50kW"
  
  odometerStart   Int?
  odometerEnd     Int?
  
  kwhCharged      Float
  costPEN         Float    // Cost in Soles
  
  durationMinutes Int?
  
  notes           String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model FuelUp {
  id              String   @id @default(cuid())
  vehicleId       String
  vehicle         Vehicle  @relation(fields: [vehicleId], references: [id])
  
  date            DateTime
  odometer        Int
  
  liters          Float
  costPEN         Float
  costPerLiter    Float
  
  location        String?
  notes           String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Service {
  id              String   @id @default(cuid())
  vehicleId       String
  vehicle         Vehicle  @relation(fields: [vehicleId], references: [id])
  
  date            DateTime
  odometer        Int
  
  serviceType     String   // "Oil Change", "Major Service", etc.
  costPEN         Float
  
  provider        String?  // "Derco Center Surco"
  notes           String?
  receiptUrl      String?  // Optional photo upload
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Trip {
  id              String   @id @default(cuid())
  vehicleId       String
  vehicle         Vehicle  @relation(fields: [vehicleId], references: [id])
  
  date            DateTime
  
  startOdometer   Int
  endOdometer     Int
  distance        Int      // Calculated
  
  purpose         String   // "Work", "Personal", "Weekend"
  mode            String   // "Electric", "REEV", "Mixed"
  
  notes           String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Settings {
  id              String   @id @default(cuid())
  userId          String   @unique
  
  currency        String   @default("PEN")
  units           String   @default("metric") // km, kWh
  language        String   @default("es")
  theme           String   @default("dark")
  
  notificationsEnabled Boolean @default(true)
  
  electricityRateKwh Float  @default(0.73) // S/ per kWh
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## 🎨 UI/UX WIREFRAME CONCEPTS

### Home Screen (Mobile)
```
┌─────────────────────────────┐
│  [☰]  DEEPAL S05   [⚙️]     │
├─────────────────────────────┤
│                             │
│    [3D Model of Car]        │
│    (Rotatable, Interactive) │
│                             │
│  ┌─────────────────────┐   │
│  │   Battery: 87%      │   │
│  │   Range: 109 km     │   │
│  └─────────────────────┘   │
├─────────────────────────────┤
│ ┌───────────┐ ┌───────────┐│
│ │This Month │ │  Cost/km  ││
│ │  S/ 79    │ │ S/ 0.18   ││
│ └───────────┘ └───────────┘│
│ ┌───────────┐ ┌───────────┐│
│ │ Electric  │ │Next Service│
│ │   100%    │ │ 4,200 km  ││
│ └───────────┘ └───────────┘│
├─────────────────────────────┤
│  Recent Activity            │
│  ○ Jan 24 - Home charge     │
│  ○ Jan 20 - Jockey charge   │
│  ○ Jan 17 - Home charge     │
├─────────────────────────────┤
│  [⚡ Charges] [⛽ Fuel]      │
│  [🔧 Service] [📊 Stats]    │
└─────────────────────────────┘
```

### Add Charge Screen
```
┌─────────────────────────────┐
│  [←]  Add Charge            │
├─────────────────────────────┤
│  Date:    [Jan 24, 2026  ▼]│
│  Time:    [10:30 PM      ▼]│
├─────────────────────────────┤
│  Location:                  │
│  ( ) Home                   │
│  ( ) Jockey Plaza           │
│  ( ) Larcomar               │
│  ( ) Other: [_________]     │
├─────────────────────────────┤
│  Charge Type:               │
│  ( ) AC 7kW (Home)          │
│  ( ) AC 22kW (Fast)         │
│  ( ) DC 50kW+ (Ultra Fast)  │
├─────────────────────────────┤
│  Odometer (km):  [_______]  │
│  kWh Charged:    [27.28  ]  │
│  Cost (S/):      [19.91  ]  │
│  Duration (min): [_______]  │
├─────────────────────────────┤
│  Notes: [________________]  │
├─────────────────────────────┤
│      [Cancel]  [Save]       │
└─────────────────────────────┘
```

### Analytics Dashboard
```
┌─────────────────────────────┐
│  [←]  Analytics             │
├─────────────────────────────┤
│  Monthly Cost Breakdown     │
│  ┌─────────────────────────┤
│  │ [Bar Chart]             │
│  │  Electric | Gas | Maint │
│  │   S/79   | S/0 | S/0    │
│  └─────────────────────────┤
├─────────────────────────────┤
│  Usage Distribution         │
│  ┌─────────────────────────┤
│  │ [Pie Chart]             │
│  │  Electric: 100%         │
│  │  Gas: 0%                │
│  └─────────────────────────┤
├─────────────────────────────┤
│  Cost Per Km Trend          │
│  ┌─────────────────────────┤
│  │ [Line Chart]            │
│  │  Jan | Feb | Mar        │
│  │ 0.18 | 0.17 | 0.16      │
│  └─────────────────────────┤
└─────────────────────────────┘
```

---

## 🚀 DEVELOPMENT PHASES

### Phase 1: Core Setup (Day 1)
- [x] Initialize Next.js project with TypeScript
- [x] Set up Tailwind CSS + shadcn/ui
- [x] Configure Prisma + PostgreSQL (Railway)
- [x] Design database schema
- [x] Set up basic routing structure
- [x] Implement dark theme base styles
- [x] Configure PWA settings (next-pwa)

### Phase 2: 3D Model Integration (Day 1-2)
- [ ] Source Deepal S05 3D model (GLB/GLTF)
- [ ] Integrate @react-three/fiber
- [ ] Create interactive 3D viewer component
- [ ] Implement rotation controls
- [ ] Add lighting and environment
- [ ] Optimize model performance

### Phase 3: Core Features (Day 2-3)
- [ ] Home Dashboard
  - [ ] 3D model hero section
  - [ ] Battery/range display
  - [ ] Quick stats cards
  - [ ] Recent activity feed
- [ ] Charging Log
  - [ ] Add charge form
  - [ ] Charge history list
  - [ ] Basic filtering
- [ ] Fuel Log
  - [ ] Add fuel-up form
  - [ ] Fuel history list

### Phase 4: Data Visualization (Day 3-4)
- [ ] Analytics Dashboard
  - [ ] Monthly cost breakdown chart
  - [ ] Usage distribution pie chart
  - [ ] Cost per km trend line
- [ ] Charge/fuel history charts
- [ ] Export to CSV functionality

### Phase 5: Maintenance & Settings (Day 4)
- [ ] Maintenance tracker
  - [ ] Service records
  - [ ] Service reminders
  - [ ] Timeline view
- [ ] Settings page
  - [ ] User preferences
  - [ ] Data export/import
- [ ] Vehicle info page

### Phase 6: Polish & PWA (Day 5)
- [ ] Responsive design refinement
- [ ] Animations and transitions (Framer Motion)
- [ ] PWA configuration
  - [ ] Service worker
  - [ ] Offline functionality
  - [ ] Install prompts
- [ ] Performance optimization
- [ ] Cross-browser testing

### Phase 7: Deployment
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Configure domain (if applicable)
- [ ] Set up CI/CD pipeline
- [ ] Production testing

---

## 🎯 SUCCESS METRICS

**Functional:**
- [ ] App loads in <2 seconds on 4G
- [ ] 3D model renders smoothly (60fps) on mobile
- [ ] All CRUD operations work offline (PWA)
- [ ] Data persists correctly
- [ ] Export/import functions work
- [ ] Charts render accurately

**User Experience:**
- [ ] Intuitive navigation (user can add charge in <30 seconds)
- [ ] Aesthetically matches Deepal OS 3.0 vibe
- [ ] Responsive on phone, tablet, desktop
- [ ] Smooth animations, no jank
- [ ] Accessible (WCAG AA minimum)

**Technical:**
- [ ] TypeScript strict mode with no errors
- [ ] Lighthouse score >90 (Performance, Accessibility, Best Practices, SEO)
- [ ] PWA installable on iOS and Android
- [ ] Database queries optimized (<100ms)
- [ ] Bundle size <500KB initial load

---

## 📚 RESOURCES & REFERENCES

### Design Inspiration
- Deepal OS 3.0 infotainment system
- Huawei HarmonyOS automotive UI
- Tesla Model 3/Y touchscreen interface
- Rivian driver display
- Lucid Air UX

### 3D Model Sources
- **Sketchfab:** https://sketchfab.com (search "Deepal", "Changan", "Chinese EV")
- **Free3D:** https://free3d.com
- **CGTrader:** https://www.cgtrader.com
- **TurboSquid:** https://www.turbosquid.com
- **Poly Haven:** https://polyhaven.com (if simple placeholder needed)

### Technical Documentation
- **React Three Fiber:** https://docs.pmnd.rs/react-three-fiber
- **Three.js:** https://threejs.org/docs
- **GLTFJSX:** https://github.com/pmndrs/gltfjsx (GLB to JSX converter)
- **Next.js:** https://nextjs.org/docs
- **Prisma:** https://www.prisma.io/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Framer Motion:** https://www.framer.com/motion

### Deepal S05 Information
- Official specs: https://www.deepal.com.pk/S05
- Review: https://electriccarwiki.com/changan-deepal-s05-review
- Wikipedia: https://en.wikipedia.org/wiki/Deepal_S05

---

## ⚠️ IMPORTANT NOTES & CONSTRAINTS

1. **REEV vs BEV:** This is NOT a pure electric vehicle. It's a REEV (Range Extended Electric Vehicle), meaning:
   - Primary power: Electric motor + battery
   - Backup: Gasoline generator (does NOT drive wheels, only charges battery)
   - Most usage: 100% electric
   - Gasoline: Rarely used (long trips, emergencies)

2. **Dual Tracking:** App must track BOTH:
   - Electricity (kWh, S/, location, charge type)
   - Gasoline (liters, S/, when generator is used)

3. **Peruvian Context:**
   - Currency: Soles (S/)
   - Units: Metric (km, kWh, liters)
   - Language: Spanish (primary), English (secondary)
   - Electricity cost: Variable but ~S/ 0.73/kWh residential

4. **Design Priority:** 
   - Must feel like part of the Deepal ecosystem
   - Dark theme ONLY initially (spacecraft cockpit vibe)
   - Futuristic but not over-the-top
   - Usable while driving (large touch targets, high contrast)

5. **3D Model:**
   - If exact Deepal S05 model not found, use similar modern SUV and clearly note it's a placeholder
   - Prioritize performance over extreme detail
   - Model should be <5MB compressed

6. **Offline-First:**
   - Core functionality (viewing data, adding entries) must work offline
   - Sync when online
   - PWA must be installable

7. **Mobile-First:**
   - Primary usage: iPhone/Android
   - Secondary: iPad/Tablet
   - Tertiary: Desktop/laptop

---

## 🎬 GETTING STARTED

**Your task:**
1. Set up the Next.js + TypeScript + Tailwind project structure
2. Configure Prisma with the provided schema
3. Source or create a 3D model of the Deepal S05 (or similar)
4. Build the home dashboard with 3D model integration
5. Implement the charging log (add + view)
6. Create the analytics dashboard with charts
7. Style everything to match Deepal OS 3.0 aesthetic
8. Configure as PWA
9. Deploy to Vercel + Railway

**Deliverables:**
- Fully functional PWA
- Source code in GitHub repo
- Deployed URL
- Brief documentation on adding entries and using features

**Timeline:** 5-7 days for MVP

---

## 🤝 COLLABORATION

**Stack Preferences:**
- Vercel (Frontend) + Railway (Backend)
- Next.js 14+ (App Router, TypeScript)
- Prisma + PostgreSQL
- Three.js ecosystem
- Tailwind + shadcn/ui

**Code Style:**
- TypeScript strict mode
- ESLint + Prettier
- Functional components (React)
- Server components where possible (Next.js)
- API routes in Next.js or separate Express server

**Communication:**
- GitHub Issues for feature requests
- Discord/Slack for quick questions (if applicable)
- Code reviews on pull requests

---

## 🚀 LET'S BUILD THIS!

This is a real-world app for a real car purchased in Lima, Peru. The goal is to create something **useful** (track costs accurately), **beautiful** (Deepal OS aesthetic), and **fun** (3D model, smooth animations).

Let's make the best damn EV tracking app anyone's ever seen. 🔥

Ready when you are! 🚗⚡
