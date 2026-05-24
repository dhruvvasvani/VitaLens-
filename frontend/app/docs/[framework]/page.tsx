import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import DocsClient from "./DocsClient";

const API_URL = "http://localhost:8000"; // shown in code examples

/* ─── Framework data ─────────────────────────────────────── */
type Step = {
  title: string;
  desc: string;
  code?: string;
  lang?: string;
  note?: string;
  warning?: string;
};

type Framework = {
  id: string;
  name: string;
  icon: string;
  color: string;
  badge: string;
  tagline: string;
  prereqs: string[];
  steps: Step[];
  verify: string;
  liveDemo?: string;
};

const FRAMEWORKS: Record<string, Framework> = {
  /* ── HTML ─────────────────────────────────────────────── */
  html: {
    id: "html",
    name: "Plain HTML",
    icon: "🌐",
    color: "#f97316",
    badge: "Works everywhere",
    tagline: "The simplest integration possible. Works on any HTML page — static sites, PHP, Laravel, Django, or raw HTML files.",
    prereqs: [
      "A website with an editable HTML file",
      "Access to the <head> section of your page",
      "PerfAgent backend running (localhost:8000 or deployed URL)",
    ],
    steps: [
      {
        title: "Open your HTML file",
        desc: "Open the main HTML file for your website. This could be index.html, a template file, or any page where you have access to the <head> section.",
        note: "You only need to add this to one file (your main layout/template) and it will track all pages automatically.",
      },
      {
        title: "Add the config script to <head>",
        desc: "Paste this snippet inside your <head> tag, before the closing </head>. This sets your project ID and backend URL.",
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Website</title>

  <!-- ✅ Step 1: PerfAgent config (add BEFORE rum.js) -->
  <script>
    window.PERF_PROJECT_ID = "proj_YOUR_ID_HERE";
    window.PERF_API        = "${API_URL}";
  </script>

  <!-- ✅ Step 2: PerfAgent tracking script -->
  <script src="${API_URL}/rum.js" async></script>

</head>
<body>
  <!-- your page content -->
</body>
</html>`,
        lang: "html",
      },
      {
        title: "Replace the placeholder values",
        desc: "Update the two values in the config script to match your setup.",
        code: `window.PERF_PROJECT_ID = "proj_abc12345";   // Your unique project ID
window.PERF_API        = "${API_URL}";  // Your backend URL`,
        lang: "js",
        note: "Get your project ID from the /snippet page. If you deployed the backend, use your Railway/Render URL instead of localhost.",
      },
      {
        title: "Open your site in a browser",
        desc: "Load your page normally. Open browser DevTools → Console. You should see the PerfAgent initialization message.",
        code: `// You should see this in the browser console:
[RUM v2] Initialized – session: sess_1716123456_abc123`,
        lang: "js",
        note: "After 3–5 seconds, go to your dashboard at localhost:3000/dashboard. Metrics will appear automatically.",
      },
    ],
    verify: "Open your site, wait 5 seconds, then visit /dashboard. You'll see LCP, FCP, TTFB, and CLS populate in the metric cards.",
    liveDemo: "/demo/fast",
  },

  /* ── Next.js ──────────────────────────────────────────── */
  nextjs: {
    id: "nextjs",
    name: "Next.js",
    icon: "▲",
    color: "#60a5fa",
    badge: "App Router + Pages Router",
    tagline: "Use Next.js's built-in Script component for optimal loading strategy. Works with App Router (Next 13+) and Pages Router.",
    prereqs: [
      "Next.js 13+ project (App Router recommended)",
      "Node.js 18+ installed",
      "PerfAgent backend running",
    ],
    steps: [
      {
        title: "Install nothing (no package needed)",
        desc: "PerfAgent loads as an external script — you don't install any npm package. The rum.js file is served by your backend.",
        code: `# No installation needed! 🎉
# PerfAgent loads as a <script> tag, not an npm package.
# Just proceed to step 2.`,
        lang: "bash",
        note: "This keeps your bundle size zero. The script loads async and doesn't block rendering.",
      },
      {
        title: "Add to app/layout.tsx (App Router)",
        desc: "Open your root layout file. Add the Script components inside <head>. The config must use beforeInteractive so it loads before rum.js.",
        code: `// app/layout.tsx
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "My App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Step 1: Config — must load BEFORE rum.js */}
        <Script id="perf-config" strategy="beforeInteractive">
          {\`
            window.PERF_PROJECT_ID = "proj_YOUR_ID_HERE";
            window.PERF_API        = "${API_URL}";
          \`}
        </Script>

        {/* ✅ Step 2: Tracking script */}
        <Script
          src="${API_URL}/rum.js"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}`,
        lang: "tsx",
        note: "strategy='afterInteractive' means it loads after the page is interactive — zero impact on your Core Web Vitals score.",
      },
      {
        title: "Or: Add to pages/_app.tsx (Pages Router)",
        desc: "If you're using the older Pages Router instead of App Router, add the scripts here:",
        code: `// pages/_app.tsx
import type { AppProps } from "next/app";
import Script from "next/script";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* ✅ PerfAgent config */}
      <Script id="perf-config" strategy="beforeInteractive">
        {\`
          window.PERF_PROJECT_ID = "proj_YOUR_ID_HERE";
          window.PERF_API        = "${API_URL}";
        \`}
      </Script>

      {/* ✅ PerfAgent RUM */}
      <Script
        src="${API_URL}/rum.js"
        strategy="afterInteractive"
      />

      <Component {...pageProps} />
    </>
  );
}`,
        lang: "tsx",
      },
      {
        title: "Add environment variable (optional but recommended)",
        desc: "Instead of hardcoding the URL, use a Next.js environment variable. This lets you switch between dev/prod easily.",
        code: `// .env.local
NEXT_PUBLIC_PERF_API=http://localhost:8000
NEXT_PUBLIC_PERF_PROJECT_ID=proj_YOUR_ID_HERE

// Then in layout.tsx:
<Script id="perf-config" strategy="beforeInteractive">
  {\`
    window.PERF_PROJECT_ID = "${"`"}${process.env.NEXT_PUBLIC_PERF_PROJECT_ID}${"` "}";
    window.PERF_API        = "${"`"}${process.env.NEXT_PUBLIC_PERF_API}${"` "}";
  \`}
</Script>`,
        lang: "bash",
        note: "NEXT_PUBLIC_ prefix is required for the variable to be accessible in the browser.",
      },
    ],
    verify: "Run npm run dev, open your app, wait 5 seconds, then visit localhost:3000/dashboard. Your app's metrics will appear.",
    liveDemo: "/demo/fast",
  },

  /* ── React ────────────────────────────────────────────── */
  react: {
    id: "react",
    name: "React (Vite / CRA)",
    icon: "⚛️",
    color: "#2dd4bf",
    badge: "Vite + CRA + custom setups",
    tagline: "For React apps built with Vite or Create React App. Add to index.html for all pages, or initialize via a hook for SPA route tracking.",
    prereqs: [
      "React 17+ project (Vite or Create React App)",
      "Access to public/index.html",
      "PerfAgent backend running",
    ],
    steps: [
      {
        title: "Add the script to public/index.html",
        desc: "Open public/index.html (or index.html in Vite). Add both script tags inside <head>. This file is the single HTML page that wraps your entire React app.",
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My React App</title>

  <!-- ✅ PerfAgent config -->
  <script>
    window.PERF_PROJECT_ID = "proj_YOUR_ID_HERE";
    window.PERF_API        = "${API_URL}";
  </script>

  <!-- ✅ PerfAgent tracking -->
  <script src="${API_URL}/rum.js" async></script>

</head>
<body>
  <div id="root"></div>
</body>
</html>`,
        lang: "html",
      },
      {
        title: "For Vite: use VITE_ environment variables",
        desc: "Create a .env file to keep your config clean and switch between environments easily.",
        code: `# .env (Vite)
VITE_PERF_API=http://localhost:8000
VITE_PERF_PROJECT_ID=proj_YOUR_ID_HERE

# Then in index.html:
<script>
  window.PERF_PROJECT_ID = "%VITE_PERF_PROJECT_ID%";
  window.PERF_API        = "%VITE_PERF_API%";
</script>`,
        lang: "bash",
        note: "Vite replaces %VITE_*% placeholders in index.html at build time.",
      },
      {
        title: "Optional: initialize from a React hook (advanced)",
        desc: "If you want programmatic control — e.g., to add user context — you can initialize from a React component instead.",
        code: `// src/components/PerfAgent.tsx
"use client";
import { useEffect } from "react";

export function PerfAgent() {
  useEffect(() => {
    // Dynamically load rum.js
    const config = document.createElement("script");
    config.textContent = \`
      window.PERF_PROJECT_ID = "proj_YOUR_ID_HERE";
      window.PERF_API = "${API_URL}";
    \`;
    document.head.appendChild(config);

    const script = document.createElement("script");
    script.src = "${API_URL}/rum.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return null;
}

// src/main.tsx — add inside <App>
import { PerfAgent } from "./components/PerfAgent";

function App() {
  return (
    <>
      <PerfAgent />
      {/* rest of your app */}
    </>
  );
}`,
        lang: "tsx",
      },
      {
        title: "Run your app and verify",
        desc: "Start your dev server and open the browser console. You should see the PerfAgent initialization log.",
        code: `# Vite
npm run dev

# Create React App
npm start

# Check the browser console for:
# [RUM v2] Initialized – session: sess_xxxxxxxx`,
        lang: "bash",
        note: "Navigate between pages in your SPA — each route change triggers a new measurement cycle.",
      },
    ],
    verify: "Open your React app, navigate a few pages, then check localhost:3000/dashboard. Metrics appear within 5 seconds.",
    liveDemo: "/demo/fast",
  },

  /* ── Nuxt ─────────────────────────────────────────────── */
  nuxt: {
    id: "nuxt",
    name: "Nuxt 3",
    icon: "💚",
    color: "#4ade80",
    badge: "SSR + SSG ready",
    tagline: "Configure via nuxt.config.ts for clean integration. Works with SSR, SSG, and hybrid rendering modes.",
    prereqs: [
      "Nuxt 3 project",
      "Node.js 18+ installed",
      "PerfAgent backend running",
    ],
    steps: [
      {
        title: "Add to nuxt.config.ts",
        desc: "Open nuxt.config.ts and add the PerfAgent scripts to the app.head.script array. Nuxt handles loading order automatically.",
        code: `// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  app: {
    head: {
      script: [
        // ✅ Step 1: Config script (loads first)
        {
          innerHTML: \`
            window.PERF_PROJECT_ID = "proj_YOUR_ID_HERE";
            window.PERF_API = "${API_URL}";
          \`,
          tagPosition: "head",
        },

        // ✅ Step 2: Tracking script (loads async)
        {
          src: "${API_URL}/rum.js",
          async: true,
          tagPosition: "head",
        },
      ],
    },
  },
});`,
        lang: "ts",
        note: "Nuxt automatically injects these into every page's <head>, including SSR-rendered pages.",
      },
      {
        title: "Use runtimeConfig for environment variables",
        desc: "In production, use Nuxt's runtimeConfig to inject the API URL from environment variables rather than hardcoding it.",
        code: `// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      perfApi: process.env.NUXT_PUBLIC_PERF_API || "${API_URL}",
      perfProjectId: process.env.NUXT_PUBLIC_PERF_PROJECT_ID || "proj_default",
    },
  },
});

// .env
NUXT_PUBLIC_PERF_API=http://localhost:8000
NUXT_PUBLIC_PERF_PROJECT_ID=proj_YOUR_ID_HERE`,
        lang: "ts",
      },
      {
        title: "Or: use a Nuxt plugin (advanced control)",
        desc: "If you need to run code after the page loads (e.g., to add user context), create a client-side Nuxt plugin.",
        code: `// plugins/perfagent.client.ts
// The .client.ts suffix means this only runs in the browser (not SSR)

export default defineNuxtPlugin(() => {
  // Set config
  window.PERF_PROJECT_ID = "proj_YOUR_ID_HERE";
  window.PERF_API = "${API_URL}";

  // Load rum.js dynamically
  const script = document.createElement("script");
  script.src = \`\${window.PERF_API}/rum.js\`;
  script.async = true;
  document.head.appendChild(script);
});`,
        lang: "ts",
        note: "The .client.ts suffix ensures this plugin never runs on the server — it only executes in the user's browser.",
      },
      {
        title: "Restart dev server and verify",
        desc: "Restart your Nuxt dev server to pick up the config changes. Check the browser console for confirmation.",
        code: `# Restart the dev server
npm run dev

# Check browser DevTools > Console:
# [RUM v2] Initialized – session: sess_xxxxxxxx

# Check browser DevTools > Network:
# Look for a POST to /api/performance/bulk`,
        lang: "bash",
      },
    ],
    verify: "Restart your Nuxt app, navigate a few pages, then check localhost:3000/dashboard. TTFB and LCP will appear first.",
    liveDemo: "/demo/fast",
  },

  /* ── Vue ──────────────────────────────────────────────── */
  vue: {
    id: "vue",
    name: "Vue 3",
    icon: "💚",
    color: "#a78bfa",
    badge: "Vite + Vue CLI",
    tagline: "Add to your Vue 3 SPA via index.html (recommended) or initialize from main.ts for full programmatic control.",
    prereqs: [
      "Vue 3 project (Vite + Vue or Vue CLI)",
      "Access to index.html or public/index.html",
      "PerfAgent backend running",
    ],
    steps: [
      {
        title: "Add scripts to index.html",
        desc: "Open index.html (in the project root for Vite, or public/index.html for Vue CLI). Add both script tags to <head>.",
        code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Vue App</title>

  <!-- ✅ PerfAgent config -->
  <script>
    window.PERF_PROJECT_ID = "proj_YOUR_ID_HERE";
    window.PERF_API        = "${API_URL}";
  </script>

  <!-- ✅ PerfAgent tracking -->
  <script src="${API_URL}/rum.js" async></script>

</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>`,
        lang: "html",
      },
      {
        title: "Or: initialize from main.ts",
        desc: "Alternatively, you can load PerfAgent programmatically from your main.ts file. This gives you more control over when it initializes.",
        code: `// src/main.ts
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// ✅ Load PerfAgent before mounting
function loadPerfAgent() {
  window.PERF_PROJECT_ID = "proj_YOUR_ID_HERE";
  window.PERF_API = "${API_URL}";

  const script = document.createElement("script");
  script.src = \`\${window.PERF_API}/rum.js\`;
  script.async = true;
  document.head.appendChild(script);
}

loadPerfAgent();

const app = createApp(App);
app.use(router);
app.mount("#app");`,
        lang: "ts",
        note: "Call loadPerfAgent() before app.mount() so the RUM script is ready when the first page renders.",
      },
      {
        title: "Track Vue Router navigation (optional)",
        desc: "To accurately track metrics across SPA route changes, you can hook into Vue Router's navigation guard.",
        code: `// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [ /* your routes */ ],
});

// ✅ Optional: log route changes to console for debugging
router.afterEach((to) => {
  console.debug("[PerfAgent] Route changed:", to.fullPath);
  // The rum.js script automatically re-measures on navigation
});

export default router;`,
        lang: "ts",
        note: "PerfAgent's RUM script automatically handles SPA navigation — this step is just for extra visibility.",
      },
      {
        title: "Run your app and verify",
        desc: "Start your dev server and check the browser console for the PerfAgent init message.",
        code: `# Vite + Vue
npm run dev

# Vue CLI
npm run serve

# ✅ You should see in the console:
# [RUM v2] Initialized – session: sess_xxxxxxxx

# ✅ Check Network tab:
# POST http://localhost:8000/api/performance/bulk`,
        lang: "bash",
      },
    ],
    verify: "Open your Vue app, click around for 5–10 seconds, then check localhost:3000/dashboard. All 5 Core Web Vitals will appear.",
    liveDemo: "/demo/fast",
  },

  /* ── WordPress ────────────────────────────────────────── */
  wordpress: {
    id: "wordpress",
    name: "WordPress",
    icon: "📝",
    color: "#fbbf24",
    badge: "No-code option",
    tagline: "No coding required. Use a free plugin or the theme editor to add PerfAgent to every page on your WordPress site.",
    prereqs: [
      "WordPress site with admin access",
      "Either: 'Insert Headers and Footers' plugin (recommended) OR access to theme editor",
      "PerfAgent backend deployed to a public URL (not localhost!)",
    ],
    steps: [
      {
        title: "Deploy your backend first",
        desc: "WordPress sites are live on the internet, so your PerfAgent backend must also be live — not localhost. Deploy it to Railway, Render, or any hosting service.",
        code: `# Option 1: Railway (recommended, free tier)
npm install -g @railway/cli
railway login
railway up

# You'll get a URL like:
# https://perfagent-production.railway.app

# Option 2: Render.com
# Push to GitHub → Connect to Render → Deploy
# Free tier available`,
        lang: "bash",
        warning: "WordPress sites cannot reach localhost:8000. You must use a publicly accessible URL.",
      },
      {
        title: "Method A: Use 'Insert Headers and Footers' plugin",
        desc: "This is the easiest method. Install the free plugin, then paste the script in the 'Scripts in Header' box.",
        code: `<!-- Paste this in: Settings → Insert Headers and Footers → Scripts in Header -->

<script>
  window.PERF_PROJECT_ID = "proj_YOUR_ID_HERE";
  window.PERF_API        = "https://your-backend.railway.app";
</script>
<script src="https://your-backend.railway.app/rum.js" async></script>`,
        lang: "html",
        note: "Plugin to install: 'WPCode – Insert Headers and Footers + Custom Code Snippets' by WPCode (free, 1M+ installs).",
      },
      {
        title: "Method B: Add to theme's functions.php",
        desc: "If you prefer code, add this to your child theme's functions.php file (always use a child theme to survive updates).",
        code: `<?php
// Add to: Appearance → Theme File Editor → functions.php
// Or your child theme's functions.php

function perfagent_add_scripts() {
    ?>
    <script>
        window.PERF_PROJECT_ID = "proj_YOUR_ID_HERE";
        window.PERF_API        = "https://your-backend.railway.app";
    </script>
    <script src="https://your-backend.railway.app/rum.js" async></script>
    <?php
}
add_action('wp_head', 'perfagent_add_scripts', 1);`,
        lang: "php",
        note: "The priority '1' ensures PerfAgent loads before other scripts that might affect performance measurements.",
      },
      {
        title: "Verify it's working",
        desc: "Visit your WordPress site and open browser DevTools. Check the Console and Network tabs.",
        code: `// Browser Console should show:
[RUM v2] Initialized – session: sess_xxxxxxxx

// Browser Network tab → filter by 'bulk':
// POST https://your-backend.railway.app/api/performance/bulk
// Status: 200 OK`,
        lang: "js",
        note: "Then open your PerfAgent dashboard. You'll see WordPress page metrics — WordPress sites often have high LCP due to plugins, so expect interesting data!",
      },
    ],
    verify: "Visit your WordPress site, navigate to 2–3 pages, then open your PerfAgent dashboard. You'll see real metrics from your WP site.",
    liveDemo: "/demo/slow",
  },
};

type Props = { params: Promise<{ framework: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { framework } = await params;
  const fw = FRAMEWORKS[framework];
  if (!fw) return { title: "Not Found" };
  return {
    title: `${fw.name} Integration Guide – PerfAgent`,
    description: fw.tagline,
  };
}

export async function generateStaticParams() {
  return Object.keys(FRAMEWORKS).map((id) => ({ framework: id }));
}

export default async function FrameworkGuide({ params }: Props) {
  const { framework } = await params;
  const fw = FRAMEWORKS[framework];
  if (!fw) notFound();

  const fwList = Object.values(FRAMEWORKS);
  const currentIdx = fwList.findIndex((f) => f.id === framework);
  const prev = fwList[currentIdx - 1];
  const next = fwList[currentIdx + 1];

  return (
    <>
      <Navbar />
      <DocsClient fw={fw} prev={prev} next={next} allFrameworks={fwList} />
    </>
  );
}
