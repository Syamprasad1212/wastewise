# WasteWise – Village Waste Management & Segregation System
## గ్రామ చెత్త నిర్వహణ మరియు వర్గీకరణ వ్యవస్థ

**WasteWise** is a full-stack, responsive public-service web application designed specifically for Indian Grama Panchayats, rural households, and sanitation workers. It eliminates improper dry and wet waste dumping, coordinates daily waste collection routes, turns organic waste into agricultural compost, and resolves community waste grievances with photo verification.

---

## 🌟 Key Modules & Features

### 1. 🏠 Public Home & Awareness
- **Visual Problem Explainer**: Side-by-side comparison of the hazards of mixed waste vs. the benefits of segregation.
- **4-Color Household Segregation Guide**:
  - 🟢 **Green Bin**: Wet & organic kitchen scraps (100% compostable).
  - 🔵 **Blue Bin**: Clean plastic bottles, paper, tins, glass (100% recyclable).
  - 🟡 **Yellow / Marked**: Sanitary napkins and baby diapers wrapped in paper with red cross.
  - 🔴 **Red Box**: Farm pesticides, old batteries, CFL tubes (toxic hazards).
- **Interactive Segregation Quiz**: 5-question rural cleanliness knowledge test with instant scoring and audio.

### 2. 🔍 Smart Waste Identification Guide
- Searchable catalog of rural household waste items (Banana peel, vegetable scraps, coconut shells, milk pouches, bottles, pesticide cans, etc.).
- Categorization into Wet, Dry, Sanitary, and Hazardous with color badges.
- Step-by-step disposal instructions and agricultural composting suitability.
- Integrated Web Speech API audio assistance in **Telugu (తెలుగు)** and **English**.

### 3. 👥 Multi-Role Dashboards

| Role | Capabilities |
| :--- | :--- |
| **Citizen (గ్రామస్థుడు)** | File dump complaints with camera photos, track grievance resolution progress in real time, view morning collection timings, submit cleanliness feedback. |
| **Sanitation Worker (పారిశుద్ధ్య మిత్ర)** | View assigned cleaning tasks, update job progress (`in_progress` → `resolved`), upload completed-work proof photos, report households giving mixed waste, and log daily waste weights (wet, dry, mixed kg). |
| **Panchayat Admin (సర్పంచ్ / కార్యదర్శి)** | Village KPI statistics (registered households, pending/resolved grievances, waste volume charts), assign complaints to workers, manage ward schedules, and monitor compost batches. |

### 4. 🌐 Bilingual & Rural Accessibility
- Full language toggle between **English** and **తెలుగు** across all screens.
- **Simple Accessibility Mode**: Large font typography, high-contrast visual tokens, minimal typing requirements, and browser text-to-speech for instructions.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (custom eco-forest green palette)
- **Icons**: Lucide React
- **Database & Auth**: PostgreSQL via Supabase with Row Level Security (RLS)
- **Deployment**: Vercel & GitHub ready

---

## 🚀 Getting Started Locally

### 1. Clone & Install
```bash
git clone https://github.com/your-username/wastewise.git
cd wastewise
npm install
```

### 2. Configure Supabase (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update the keys with your Supabase project settings:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```
> *Note: WasteWise includes a full built-in offline simulation mode with local storage persistence. The entire application runs out of the box even without external Supabase credentials!*

### 3. Setup Supabase Database
Run the complete SQL migration located in `supabase/schema.sql` in your Supabase SQL Editor:
- Tables created: `profiles`, `households`, `waste_reports`, `worker_assignments`, `waste_schedules`, `collection_records`, `compost_records`, `feedback`.
- Row Level Security (RLS) policies enabled.
- Storage bucket `waste-photos` configured.
- Run `supabase/seed.sql` to populate sample Grama Panchayat wards and households.

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 🏛️ Deployment to Vercel

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the `wastewise` repository.
4. Set the Framework Preset to **Vite**.
5. Add your environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
6. Click **Deploy**. SPA rewrites are already configured in `vercel.json`.

---

## 📄 License
This project is developed under the open public-service initiative for Indian Grama Panchayats and Swachh Bharat Mission (Gramin).
