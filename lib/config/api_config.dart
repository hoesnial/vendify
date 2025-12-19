class ApiConfig {
  // Base URLs
  // PENTING: Untuk device fisik, gunakan IP komputer di network yang sama
  // Backend berjalan di port 3001, Frontend di port 3000
  static const String developmentUrl =
      'http://192.168.100.17:3001/api'; // Device Fisik - IP Komputer
  static const String frontendUrl =
      'http://192.168.100.17:3000'; // Frontend Next.js - IP Komputer
  // static const String developmentUrl = 'http://10.0.2.2:3001/api'; // Android Emulator
  // static const String frontendUrl = 'http://10.0.2.2:3000'; // Android Emulator
  // static const String developmentUrl = 'http://localhost:3001/api'; // iOS Simulator
  // static const String frontendUrl = 'http://localhost:3000'; // iOS Simulator

  // Production URLs - Update with your actual Render & Vercel URLs
  static const String productionUrl = 'https://vending-be.onrender.com/api';
  static const String productionFrontendUrl = 'https://vending-fe.vercel.app';

  // Current environment
  // GANTI ke true untuk menggunakan production API
  static const bool isProduction = false;

  // Get active base URL
  static String get baseUrl => isProduction ? productionUrl : developmentUrl;
  static String get frontendBaseUrl =>
      isProduction ? productionFrontendUrl : frontendUrl;

  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Headers
  static Map<String, String> get headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Midtrans
  static const String midtransClientKey = 'Mid-client-sDJzIOF086-ENIyv';
  static const bool midtransIsProduction = false;
}

class ApiEndpoints {
  // Products
  static const String products = '/products';
  static String productById(String id) => '/products/$id';

  // Orders
  static const String orders = '/orders';
  static String orderById(String id) => '/orders/$id';
  static String updateOrderStatus(String id) => '/orders/$id/status';

  // Images
  static const String uploadImage = '/upload';

  // Payment (via frontend Next.js API)
  static String createPayment =
      '${ApiConfig.frontendBaseUrl}/api/payment/create';
  static String paymentStatus(String orderId) =>
      '${ApiConfig.frontendBaseUrl}/api/payment/status/$orderId';
}
