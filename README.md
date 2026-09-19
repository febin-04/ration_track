# RationTrack 🌾

**RationTrack** is a real-time stock transparency portal for Fair Price Shops (FPS) under the Public Distribution System (PDS). It helps citizens check essential commodity availability before visiting local ration shops, while empowering dealers to update inventory seamlessly.

---

## ✨ Key Features

- 🛒 **Real-Time Stock Tracking**: View 3-state stock indicators (`AVAILABLE`, `LOW`, `OUT_OF_STOCK`) for Rice, Wheat/Atta, Sugar, Kerosene, and Oil.
- 🌐 **Trilingual Support**: Full localized interface in **English**, **Hindi (हिंदी)**, and **Malayalam (മലയാളം)**.
- ♿ **Accessibility First**:
  - **Text-to-Speech (Audio)**: Listen to stock details aloud.
  - **High Contrast Mode**: Enhanced visibility for outdoor & low-vision use.
  - **Large Text Mode**: Designed for elderly citizens.
- 📍 **GPS Location & Search**: Locate nearest ration shops using device location or search by shop name, FPS ID, area, or pincode.
- 👥 **Crowdsourced Verification & Feedback**: Citizens can confirm reported stock accuracy (👍/👎) and file feedback or complaints.
- 🔑 **Dealer Portal**: Secure dealer login (FPS ID + PIN) to update inventory levels, quantity notes, and expected restock dates in real time.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Database**: SQLite (`better-sqlite3`)

---

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Run Locally (Development)

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build & Production Start

```bash
npm run build
npm start
```

---

## 🔑 Demo Dealer Login Credentials

To test the Dealer Dashboard:
- **FPS Code / License ID**: `FPS-1001` (or `FPS-1002` to `FPS-1006`)
- **Security PIN**: `pin123`

---

## 📄 License

This project is open-source and free for public welfare.
