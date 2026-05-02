# THE ARCHIVE — MostlyIndia

> A dark, brutalist editorial publishing platform with a full-featured admin console. Built for curating and publishing articles across themed categories with a striking neumorphic dark UI.

---

## What Is This?

**The Archive** (branded as *MostlyIndia*) is a self-contained editorial magazine/blog platform. It lets a single administrator write, publish, and manage articles ("archive records") across custom categories. Readers get a polished, dark-themed reading experience — the admin gets a protected editorial dashboard to compose and manage content.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 6](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + custom CSS (neumorphism, CSS variables) |
| **Routing** | [React Router v7](https://reactrouter.com/) |
| **Auth & Backend** | [Supabase](https://supabase.com/) (OAuth + email/password auth) |
| **Data Storage** | `localStorage` (client-side persistence for posts & categories) |
| **Image Cropping** | [`react-easy-crop`](https://github.com/ValentinH/react-easy-crop) |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) primitives, [MUI](https://mui.com/) icons |
| **Fonts** | Archivo Black + Manrope (Google Fonts) |
| **Icons** | Google Material Symbols + Font Awesome 6 |
| **Animation** | [Motion](https://motion.dev/) (Framer Motion) |

---

## Project Structure

```
src/
├── main.tsx                  # App entry point
├── App.tsx                   # Root router + ProtectedRoute guard
├── index.css                 # Global design tokens (CSS vars, neumorphic helpers)
│
├── lib/
│   └── supabase.ts           # Supabase client (with graceful no-config fallback)
│
├── services/
│   ├── authService.ts        # Auth: login, logout, Google OAuth, isAdmin check
│   └── postService.ts        # CRUD for posts & categories (localStorage-backed)
│
├── types/
│   └── post.ts               # TypeScript Post & Author interfaces
│
├── utils/
│   └── cropImage.ts          # Canvas-based image crop utility (used by admin)
│
└── pages/
    ├── home/                 # Public reader feed
    ├── post/                 # Single article reader view
    ├── admin/                # Protected editorial dashboard
    └── login/                # Admin authentication portal
```

---

## Pages & Features

### `/` — Home Feed
- Displays all **public** posts fetched from `localStorage`
- First post renders as a large **featured story** with a cinematic cover image
- Remaining posts are shown in a **3-column masonry-style grid**
- **Category filter drawer** (slide-in from left) to filter posts by vibe/category
- Cover images render in **greyscale**, transitioning to color on hover
- Animated hamburger menu that reveals a full-screen drawer

### `/post/:id` — Article Reader
- Full-width **21:9 cinematic cover image** with greyscale-to-color hover transition
- Article body rendered as **rich HTML** (from the admin's WYSIWYG editor)
- Stylized **drop-cap** on the first letter of the article body
- **Premium link styling** with yellow glow on hover
- Reader navigation drawer with category quick-links

### `/login` — Admin Authentication
- Email + password login form connected to **Supabase Auth**
- Neumorphic dark-styled form with animated error states
- Redirects to `/admin` on successful auth elevation

### `/admin` & `/admin/:id` — Editorial Console *(Protected)*
- Route is guarded by `ProtectedRoute` — redirects to `/login` if not authenticated
- **Rich text editor** (contentEditable with `document.execCommand`) for bold, italic, lists, and links
- **Cover image management**: paste a URL or upload from device
- **Image cropper** (21:9 aspect ratio) for precision framing of cover photos
- **Post visibility toggle**: Public / Draft
- **Archive Log sidebar**: scrollable list of all posts with edit & delete actions
- **Category management**: add/remove custom categories
- **Archive Status panel**: live stats for published vs. draft posts
- Mobile-optimized **floating action button** (FAB) and bottom navigation bar

---

## Design System

- **Color Palette**: Near-black `#0e0e0e` background, electric yellow `#FBDE06` as the primary accent, `#adaaaa` for muted text
- **Typography**: `Archivo Black` for headlines & display text, `Manrope` for body copy
- **Neumorphism**: Custom `.neumorphic-flat` and `.neumorphic-inset` CSS classes used throughout for a tactile, physical UI feel
- **Dark Mode**: Entire app is dark-first; no light mode
- **Responsive**: Mobile-first layout with a floating bottom nav bar on the admin console for small screens

---

## Authentication

Auth is handled by **Supabase Auth**:
- Supports **email/password** login and **Google OAuth**
- The Supabase client has a graceful no-config fallback so the app won't crash if keys are missing
- `ProtectedRoute` in the root router blocks access to `/admin` for unauthenticated users

---

## Data Persistence

All post and category data is stored in **`localStorage`** (no database required for content):

| Key | Contents |
|---|---|
| `mostly_india_posts` | Array of all `Post` objects (JSON) |
| `mostly_india_categories` | Array of category name strings (JSON) |

The app ships with two **seed posts** that auto-populate on first load if localStorage is empty.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

> **Note:** To enable authentication, replace the Supabase URL and anon key in `src/lib/supabase.ts` with your own project credentials.

---

## Key Dependencies

```json
{
  "react": "18.3.1",
  "react-router-dom": "^7.14.1",
  "@supabase/supabase-js": "^2.103.3",
  "react-easy-crop": "^5.5.7",
  "tailwindcss": "4.1.12",
  "vite": "6.3.5",
  "motion": "12.23.24"
}
```

---

*THE ARCHIVE — Editorial Management System v2.0 · MostlyIndia*
