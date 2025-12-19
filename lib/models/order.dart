// Order item model
class OrderItem {
  final String productId;
  final String productName;
  final double price;
  final int quantity;

  OrderItem({
    required this.productId,
    required this.productName,
    required this.price,
    required this.quantity,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: (json['product_id'] ?? '').toString(),
      productName: (json['product_name'] ?? json['name'] ?? '').toString(),
      price: (json['price'] is String
          ? double.tryParse(json['price']) ?? 0.0
          : json['price'] is int || json['price'] is double
          ? (json['price']).toDouble()
          : (json['unit_price'] is String
                ? double.tryParse(json['unit_price']) ?? 0.0
                : (json['unit_price'] ?? 0).toDouble())),
      quantity: (json['quantity'] is String
          ? int.tryParse(json['quantity']) ?? 0
          : json['quantity'] ?? 0),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product_id': productId,
      'product_name': productName,
      'price': price,
      'quantity': quantity,
    };
  }
}

class Order {
  final String id;
  final String orderId;
  final String productId;
  final String productName;
  final double unitPrice;
  final int quantity;
  final double totalAmount;
  final String paymentMethod;
  final String status;
  final String? paymentUrl;
  final String? qrString;
  final DateTime? expiresAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<OrderItem> items;

  Order({
    required this.id,
    required this.orderId,
    required this.productId,
    required this.productName,
    required this.unitPrice,
    required this.quantity,
    required this.totalAmount,
    required this.paymentMethod,
    required this.status,
    this.paymentUrl,
    this.qrString,
    this.expiresAt,
    required this.createdAt,
    required this.updatedAt,
    List<OrderItem>? items,
  }) : items = items ?? [];

  factory Order.fromJson(Map<String, dynamic> json) {
    // Parse items if available
    List<OrderItem> orderItems = [];
    if (json['items'] != null && json['items'] is List) {
      orderItems = (json['items'] as List)
          .map((item) => OrderItem.fromJson(item))
          .toList();
    } else if (json['product_id'] != null && json['product_name'] != null) {
      // Create single item from order data for backward compatibility
      orderItems = [
        OrderItem(
          productId: (json['product_id'] ?? '').toString(),
          productName: json['product_name']?.toString() ?? '',
          price: (json['unit_price'] is String
              ? double.tryParse(json['unit_price']) ?? 0.0
              : (json['unit_price'] ?? 0).toDouble()),
          quantity: (json['quantity'] is String
              ? int.tryParse(json['quantity']) ?? 0
              : json['quantity'] ?? 0),
        ),
      ];
    }

    return Order(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      orderId: json['order_id']?.toString() ?? '',
      productId: (json['product_id'] ?? '').toString(),
      productName: json['product_name']?.toString() ?? '',
      unitPrice: (json['unit_price'] is String
          ? double.tryParse(json['unit_price']) ?? 0.0
          : (json['unit_price'] ?? 0).toDouble()),
      quantity: (json['quantity'] is String
          ? int.tryParse(json['quantity']) ?? 0
          : json['quantity'] ?? 0),
      totalAmount: (json['total_amount'] is String
          ? double.tryParse(json['total_amount']) ?? 0.0
          : (json['total_amount'] ?? 0).toDouble()),
      paymentMethod: json['payment_method']?.toString() ?? 'qris',
      status: json['status']?.toString() ?? 'pending',
      paymentUrl: json['payment_url']?.toString(),
      qrString: json['qr_string']?.toString(),
      expiresAt: json['expires_at'] != null
          ? DateTime.tryParse(json['expires_at'].toString())
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
      items: orderItems,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'order_id': orderId,
      'product_id': productId,
      'product_name': productName,
      'unit_price': unitPrice,
      'quantity': quantity,
      'total_amount': totalAmount,
      'payment_method': paymentMethod,
      'status': status,
      'payment_url': paymentUrl,
      'qr_string': qrString,
      'expires_at': expiresAt?.toIso8601String(),
    };
  }

  bool get isPending => status == 'pending';
  bool get isPaid =>
      status == 'paid' || status == 'settlement' || status == 'capture';
  bool get isCancelled =>
      status == 'cancelled' || status == 'deny' || status == 'expire';
  bool get isExpired => expiresAt != null && DateTime.now().isAfter(expiresAt!);

  String get statusText {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Menunggu Pembayaran';
      case 'paid':
      case 'settlement':
      case 'capture':
        return 'Pembayaran Berhasil';
      case 'cancelled':
      case 'deny':
        return 'Dibatalkan';
      case 'expire':
        return 'Kadaluarsa';
      case 'delivered':
        return 'Terkirim';
      default:
        return status;
    }
  }
}
