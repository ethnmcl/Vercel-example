# ⚡ Vercel Pulse — Edge & Cloud Deployment Suite

A modern, high-performance web application built with **Next.js 16 (App Router)** and **React 19**, tailored specifically as an example testbed for **Vercel deployment**.

---

## 🎯 Features

- **Edge & Serverless Function Testing**: Includes a live API route at `/api/diagnostic` returning runtime metrics, Vercel edge headers (`x-vercel-id`, `x-vercel-ip-country`, `x-vercel-ip-city`), Node engine versions, and execution duration.
- **Real-Time Latency Meter**: Interactive benchmarking console measuring live client-to-edge roundtrip latency in milliseconds.
- **Payload Echo Playground**: Interactive POST request tester with presets (UUID generation, deployment events) to test serverless request parsing.
- **Pre-Flight Readiness Checklist**: Interactive interactive checklist tracking framework, API, and build readiness.
- **Pure Modern CSS**: Clean styling with glassmorphism, glowing accents, and zero runtime CSS overhead.
- **Turbopack & React 19**: Blazing-fast compilation and static/serverless hybrid generation.

---

## 🛠️ Local Development

1. **Install dependencies** (already installed):
   ```bash
   npm install
   ```

2. **Run dev server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

3. **Verify production build**:
   ```bash
   npm run build
   ```

---

## 🚀 How to Deploy to Vercel

### Option 1: Instant CLI Deployment (Recommended for Quick Testing)

From the project root directory, run:

```bash
# Preview deployment
npx vercel

# Production deployment
npx vercel --prod
```

The CLI will guide you to log in to your Vercel account, link the project, and output a live preview URL in seconds!

---

### Option 2: Git-Connected Continuous Deployment

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: Vercel Pulse deployment verification app"
   ```

2. **Push to your GitHub repository**:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
   git branch -M main
   git push -u origin main
   ```

3. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your repository and click **Deploy**.
   - Vercel automatically detects Next.js settings with zero configuration needed.

---

## 📡 API Endpoint Overview

- **`GET /api/diagnostic`**: Returns JSON with hosting environment flags, region IDs, geolocation headers, and server processing duration.
- **`POST /api/diagnostic`**: Echoes submitted JSON payloads with server timestamps and execution metrics.

---

Built for seamless testing on [Vercel](https://vercel.com).
