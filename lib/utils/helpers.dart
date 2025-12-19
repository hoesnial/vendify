import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../config/api_config.dart';

class Helpers {
  // Format currency (Indonesian Rupiah)
  static String formatCurrency(double amount) {
    final formatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }

  // Get full image URL (handles both Supabase Storage and local uploads)
  static String getImageUrl(String? imageUrl) {
    // Return placeholder if no image
    if (imageUrl == null || imageUrl.isEmpty) {
      return '';
    }

    // If already absolute URL (Supabase Storage or full URL), return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // If relative path (local upload), prepend backend URL
    // Remove /api from base URL and add the image path
    final backendUrl = ApiConfig.baseUrl.replaceAll('/api', '');
    return '$backendUrl$imageUrl';
  }

  // Check if image URL is from Supabase Storage
  static bool isSupabaseStorageUrl(String? imageUrl) {
    if (imageUrl == null || imageUrl.isEmpty) return false;
    return imageUrl.contains('supabase.co/storage/v1/object/public');
  }

  // Check if image URL is local upload
  static bool isLocalUploadUrl(String? imageUrl) {
    if (imageUrl == null || imageUrl.isEmpty) return false;
    return imageUrl.startsWith('/uploads/');
  }

  // Format date
  static String formatDate(DateTime date, {String pattern = 'dd MMM yyyy'}) {
    final formatter = DateFormat(pattern, 'id_ID');
    return formatter.format(date);
  }

  // Format datetime
  static String formatDateTime(
    DateTime date, {
    String pattern = 'dd MMM yyyy HH:mm',
  }) {
    final formatter = DateFormat(pattern, 'id_ID');
    return formatter.format(date);
  }

  // Format time
  static String formatTime(DateTime date, {String pattern = 'HH:mm'}) {
    final formatter = DateFormat(pattern, 'id_ID');
    return formatter.format(date);
  }

  // Time ago
  static String timeAgo(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 365) {
      return '${(difference.inDays / 365).floor()} tahun yang lalu';
    } else if (difference.inDays > 30) {
      return '${(difference.inDays / 30).floor()} bulan yang lalu';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} hari yang lalu';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} jam yang lalu';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} menit yang lalu';
    } else {
      return 'Baru saja';
    }
  }

  // Time remaining
  static String timeRemaining(DateTime expiryDate) {
    final now = DateTime.now();
    final difference = expiryDate.difference(now);

    if (difference.isNegative) {
      return 'Expired';
    }

    final minutes = difference.inMinutes % 60;
    final seconds = difference.inSeconds % 60;

    if (difference.inHours > 0) {
      final hours = difference.inHours;
      return '$hours:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
    } else {
      return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
    }
  }

  // Truncate text
  static String truncateText(String text, int maxLength) {
    if (text.length <= maxLength) {
      return text;
    }
    return '${text.substring(0, maxLength)}...';
  }

  // Generate order ID
  static String generateOrderId() {
    final now = DateTime.now();
    final timestamp = now.millisecondsSinceEpoch;
    return 'ORD-$timestamp';
  }

  // Validate email
  static bool isValidEmail(String email) {
    return RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    ).hasMatch(email);
  }

  // Validate phone
  static bool isValidPhone(String phone) {
    return RegExp(r'^(\+62|62|0)[0-9]{9,12}$').hasMatch(phone);
  }

  // Show snackbar
  static void showSnackBar(
    BuildContext context,
    String message, {
    bool isError = false,
  }) {
    final snackBar = SnackBar(
      content: Text(message),
      backgroundColor: isError ? const Color(0xFFF44336) : null,
      duration: const Duration(seconds: 2),
    );
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }

  // Show loading dialog
  static void showLoadingDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );
  }

  // Hide loading dialog
  static void hideLoadingDialog(BuildContext context) {
    Navigator.of(context, rootNavigator: true).pop();
  }

  // Capitalize first letter
  static String capitalize(String text) {
    if (text.isEmpty) return text;
    return text[0].toUpperCase() + text.substring(1);
  }
}
