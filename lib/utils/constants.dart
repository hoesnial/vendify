// App Constants
class AppConstants {
  // App Info
  static const String appName = 'Vending Machine';
  static const String appVersion = '1.0.0';

  // Storage Keys
  static const String keyAuthToken = 'auth_token';
  static const String keyUserId = 'user_id';
  static const String keyUserName = 'user_name';
  static const String keyUserEmail = 'user_email';
  static const String keyCart = 'cart_data';

  // Payment
  static const String paymentMethodQRIS = 'qris';
  static const Duration paymentTimeout = Duration(minutes: 15);
  static const Duration paymentCheckInterval = Duration(seconds: 3);

  // Order Status
  static const String statusPending = 'pending';
  static const String statusPaid = 'paid';
  static const String statusSettlement = 'settlement';
  static const String statusCapture = 'capture';
  static const String statusCancelled = 'cancelled';
  static const String statusDeny = 'deny';
  static const String statusExpire = 'expire';
  static const String statusDelivered = 'delivered';

  // Transaction Status
  static const String transactionPending = 'pending';
  static const String transactionSuccess = 'settlement';
  static const String transactionCapture = 'capture';
  static const String transactionDeny = 'deny';
  static const String transactionCancel = 'cancel';
  static const String transactionExpire = 'expire';

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // Cache Duration
  static const Duration cacheDuration = Duration(minutes: 5);

  // Timeouts
  static const Duration apiTimeout = Duration(seconds: 30);
  static const Duration uploadTimeout = Duration(seconds: 60);

  // Image
  static const double maxImageSize = 5 * 1024 * 1024; // 5MB
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png'];

  // Regex Patterns
  static final RegExp emailRegex = RegExp(
    r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
  );
  static final RegExp phoneRegex = RegExp(r'^(\+62|62|0)[0-9]{9,12}$');
}

// Error Messages
class ErrorMessages {
  static const String networkError =
      'Network error. Please check your internet connection.';
  static const String serverError = 'Server error. Please try again later.';
  static const String unknownError = 'An unknown error occurred.';
  static const String invalidCredentials = 'Invalid email or password.';
  static const String emailRequired = 'Email is required.';
  static const String emailInvalid = 'Please enter a valid email address.';
  static const String passwordRequired = 'Password is required.';
  static const String passwordTooShort =
      'Password must be at least 6 characters.';
  static const String nameRequired = 'Name is required.';
  static const String phoneRequired = 'Phone number is required.';
  static const String phoneInvalid = 'Please enter a valid phone number.';
  static const String emptyCart = 'Your cart is empty.';
  static const String insufficientStock = 'Insufficient stock available.';
  static const String paymentFailed = 'Payment failed. Please try again.';
  static const String paymentCancelled = 'Payment was cancelled.';
  static const String paymentExpired = 'Payment has expired.';
  static const String orderNotFound = 'Order not found.';
  static const String productNotFound = 'Product not found.';
}

// Success Messages
class SuccessMessages {
  static const String loginSuccess = 'Login successful!';
  static const String logoutSuccess = 'Logout successful!';
  static const String registerSuccess = 'Registration successful!';
  static const String addToCartSuccess = 'Product added to cart.';
  static const String removeFromCartSuccess = 'Product removed from cart.';
  static const String orderPlaced = 'Order placed successfully!';
  static const String paymentSuccess = 'Payment successful!';
  static const String productCreated = 'Product created successfully!';
  static const String productUpdated = 'Product updated successfully!';
  static const String productDeleted = 'Product deleted successfully!';
}
