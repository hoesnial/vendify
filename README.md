# 📱 Vending Machine Mobile App (Flutter)

Aplikasi mobile Flutter untuk sistem vending machine yang terintegrasi dengan backend Node.js dan payment gateway Midtrans.

## 🎯 Overview

Aplikasi ini adalah client mobile untuk vending machine yang memungkinkan pengguna untuk:

- Browse produk yang tersedia
- Menambahkan produk ke cart
- Melakukan pembayaran via QRIS (Midtrans)
- Tracking order history
- Real-time payment status monitoring

## 🏗️ Tech Stack

- **Framework**: Flutter 3.9.2+
- **Language**: Dart 3.9.2+
- **State Management**: Provider
- **HTTP Client**: http package
- **Payment Gateway**: Midtrans QRIS
- **Backend Integration**: REST API

## 📁 Project Structure

```
lib/
├── config/               # Configuration files
│   ├── api_config.dart  # API endpoints & settings
│   └── theme_config.dart # App theme & styling
├── models/              # Data models
│   ├── product.dart
│   ├── order.dart
│   ├── cart_item.dart
│   └── payment.dart
├── services/            # API services
│   ├── api_service.dart
│   ├── product_service.dart
│   ├── order_service.dart
│   └── payment_service.dart
├── providers/           # State management
│   └── cart_provider.dart
├── screens/             # UI screens (to be created)
│   ├── splash_screen.dart
│   ├── home/
│   ├── products/
│   ├── cart/
│   ├── payment/
│   └── orders/
├── widgets/             # Reusable widgets (to be created)
│   ├── product_card.dart
│   ├── cart_item_widget.dart
│   └── loading_indicator.dart
└── utils/               # Utilities
    ├── constants.dart
    └── helpers.dart
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
flutter pub get
```

### 2. Configure API

Edit `lib/config/api_config.dart`:

```dart
// Android Emulator
static const String developmentUrl = 'http://10.0.2.2:5000/api';
```

### 3. Run Backend

```bash
cd ../backend
npm install
npm run dev
```

### 4. Run App

```bash
flutter run
```

## 📖 Documentation

- 📚 [Architecture Documentation](./MOBILE_ARCHITECTURE.md)
- 🚀 [Getting Started Guide](./GETTING_STARTED.md)
- 🔧 [Backend API Docs](../backend/README.md)

## 📝 Development Status

### ✅ Completed

- [x] Project structure setup
- [x] Configuration files (API, Theme)
- [x] Data models (Product, Order, Cart, Payment)
- [x] API services (Product, Order, Payment)
- [x] Cart provider (State management)
- [x] Utilities (Constants, Helpers)

### 🔄 To-Do

- [ ] UI Screens implementation
- [ ] Reusable Widgets
- [ ] Payment integration UI
- [ ] Testing

## 🐛 Troubleshooting

**Cannot connect to backend:**

- Android Emulator: Use `10.0.2.2` instead of `localhost`
- iOS Simulator: Use `localhost`
- Physical Device: Use your computer's local IP

**Build errors:**

```bash
flutter clean
flutter pub get
```

## 📄 License

Private project - All rights reserved

---

**Version**: 1.0.0  
**Status**: In Development 🚧

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
