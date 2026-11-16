# ⚡ QuickMart - Cross-Platform Real-Time Quick Commerce App

A modern, full-featured mobile app designed for **both iOS and Android** (with Web preview support) built using **React Native & Expo**.

---

## 📱 Features Included

### 🛒 Multi-Category Catalog
1. **Fresh Vegetables & Fruits**: Farm-ripe tomatoes, baby spinach, Hass avocados, crunchy carrots, English cucumbers.
2. **Pantry Groceries**: Aged 2-year Basmati rice, cold-pressed olive oil, farm eggs, artisanal whole wheat sourdough, raw blossom honey.
3. **Ice Creams & Frozen Treats**: Belgian dark chocolate fudge tub, salted caramel praline gelato, Alphonso mango kulfi bars, wild berry acai sorbet (delivered in insulated chill bags).
4. **Snacks & Munchies**: Black truffle potato crisps, peri-peri smoked almonds, artisan tortilla chips with chipotle dip, dark chocolate pretzels.
5. **Clothing & Fashion**: 240 GSM heavyweight minimalist t-shirts, vintage washed denim jacket, cloud-fleece hoodie, breathable pure linen shirt.
6. **Accessories & Lifestyle**: Slim RFID-blocking leather cardholder, polarized UV400 sunglasses, weatherproof crossbody bag, silicone smartwatch straps.

---

### 🛵 Real-Time Order & Delivery Tracking
- **Interactive Delivery Stages**:
  `Order Confirmed` ➔ `Packing at Dark Store` ➔ `Rider Assigned` ➔ `Out for Delivery 🛵` ➔ `Arrived at Door` ➔ `Delivered 🎉`
- **Real-Time Live Countdown Timer**: Dynamic seconds counter updating every second.
- **Simulated GPS Route Tracking**: Live animated rider indicator moving between the dark store and user doorstep.
- **Partner Profile & Contact**: Rider details (name, vehicle, rating), one-tap call and in-app message simulation.
- **Demo Mode**: One-tap "Launch Live Demo Order" & "Fast-Forward Next Step" to instantly test the entire tracking flow.

---

### 🛍️ Cart & Checkout System
- **Reactive Quantity Controls**: Increment, decrement, or remove items with real-time bill calculations.
- **Promo Coupon Engine**: Apply codes like `QUICK50`, `FRESHFREE`, `WELCOME10` with instant savings breakdown.
- **Rider Tipping**: Add tips ($1, $2, $3, $5) directly to the delivery partner.
- **Multiple Payment Options**: Apple Pay / Google Pay, Credit/Debit Cards, Instant UPI, and Cash on Delivery.
- **Delivery Instructions**: "Leave at door", "Don't ring bell", "Call on arrival".

---

## 🚀 How to Run & Test

### 1. Run on iOS (iPhone / iPad)
1. Install **Expo Go** from the Apple App Store on your iPhone.
2. In your terminal, run:
   ```bash
   cd quickmart
   npx expo start
   ```
3. Open your iPhone Camera and scan the **QR Code** shown in the terminal.
4. Tap the banner to open the app inside **Expo Go**!

---

### 2. Run on Android
1. Install **Expo Go** from the Google Play Store on your Android phone.
2. In your terminal, run:
   ```bash
   cd quickmart
   npx expo start
   ```
3. Open the **Expo Go** app on your Android phone and tap **"Scan QR code"**.
4. Scan the QR code in the terminal to load the app immediately with Hot Reloading.

---

### 3. Run in Web Browser
Open your browser and visit:
```
http://localhost:8081
```
Or run:
```bash
cd quickmart
npx expo start --web
```
