# photo-dashboard

> **Asset Forge — Creative Asset & 3D Model Hub**
> A modern, browser-based asset management platform built with Next.js 16, Three.js, React Three Fiber, and Supabase PostgreSQL.

---

## 🌟 Key Features

- 🎨 **Multi-Format Asset Support**: Image formats (`.png`, `.jpg`, `.webp`, `.svg`, `.gif`) + 3D Models (`.obj`, `.stl`, `.gltf`, `.glb`) + Production CAD/Sim Formats (`.fbx`, `.usd`, `.abc`).
- 🧊 **In-Browser 3D Viewport**: Interactive WebGL rendering powered by Three.js & React Three Fiber (Orbit Controls, Wireframe view, Environment lighting, Poly/Vertex counters).
- 🖼️ **Image Inspection Canvas**: Pan and zoom viewer with checkerboard transparency background.
- ⚡ **Supabase PostgreSQL & Prisma ORM**: Cloud database with schema management via Prisma.
- 🔍 **Advanced Filtering & Search**: Instant full-text search across titles, tags, prompts, and category filtering.
- 📋 **Metadata & Prompt Tracking**: Capture prompts, reference links, workflow notes, and author attributes.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
bun install
```

### 2. Environment Setup
Create or edit your `.env` file with your Supabase PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgboiler=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 3. Push Database Schema
```bash
bun run db:push
```

### 4. Run Development Server
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (Turbopack, App Router)
- **Styling**: Tailwind CSS v4 + Radix UI + shadcn/ui
- **3D Graphics**: Three.js + `@react-three/fiber` + `@react-three/drei`
- **Database**: Supabase PostgreSQL + Prisma ORM
- **State Management**: Zustand
