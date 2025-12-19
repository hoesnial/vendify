class PaymentRequest {
  final String orderId;
  final double amount;
  final String customerName;
  final String customerEmail;
  final List<PaymentItem> items;

  PaymentRequest({
    required this.orderId,
    required this.amount,
    required this.customerName,
    required this.customerEmail,
    required this.items,
  });

  Map<String, dynamic> toJson() {
    return {
      'orderId': orderId,
      'amount': amount,
      'customerName': customerName,
      'customerEmail': customerEmail,
      'items': items.map((item) => item.toJson()).toList(),
    };
  }
}

class PaymentItem {
  final String id;
  final double price;
  final int quantity;
  final String name;

  PaymentItem({
    required this.id,
    required this.price,
    required this.quantity,
    required this.name,
  });

  Map<String, dynamic> toJson() {
    return {'id': id, 'price': price, 'quantity': quantity, 'name': name};
  }
}

// Payment data model for QR payment
class Payment {
  final String orderId;
  final String qrCode;
  final double amount;
  final String status;
  final DateTime? expiresAt;

  Payment({
    required this.orderId,
    required this.qrCode,
    required this.amount,
    required this.status,
    this.expiresAt,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      orderId: json['order_id'] ?? json['orderId'] ?? '',
      qrCode: json['qr_code'] ?? json['qrCode'] ?? json['qr_string'] ?? '',
      amount: (json['amount'] ?? json['total_amount'] ?? 0).toDouble(),
      status: json['status'] ?? json['transaction_status'] ?? 'pending',
      expiresAt: json['expires_at'] != null
          ? DateTime.parse(json['expires_at'])
          : json['expiry_time'] != null
          ? DateTime.parse(json['expiry_time'])
          : null,
    );
  }
}

class PaymentResponse {
  final String token;
  final String redirectUrl;
  final String? qrCode;
  final String? orderId;
  final double? amount;

  PaymentResponse({
    required this.token,
    required this.redirectUrl,
    this.qrCode,
    this.orderId,
    this.amount,
  });

  factory PaymentResponse.fromJson(Map<String, dynamic> json) {
    return PaymentResponse(
      token: json['token'] ?? '',
      redirectUrl: json['redirect_url'] ?? json['redirectUrl'] ?? '',
      qrCode: json['qr_code'] ?? json['qrCode'] ?? json['qr_string'],
      orderId: json['order_id'] ?? json['orderId'],
      amount: json['amount'] != null
          ? (json['amount'] as num).toDouble()
          : null,
    );
  }
}

class PaymentStatus {
  final String orderId;
  final String transactionStatus;
  final String transactionTime;
  final String paymentType;
  final String fraudStatus;
  final String statusCode;
  final String statusMessage;
  final String grossAmount;
  final bool isMock;

  PaymentStatus({
    required this.orderId,
    required this.transactionStatus,
    required this.transactionTime,
    required this.paymentType,
    required this.fraudStatus,
    required this.statusCode,
    required this.statusMessage,
    required this.grossAmount,
    this.isMock = false,
  });

  factory PaymentStatus.fromJson(Map<String, dynamic> json) {
    return PaymentStatus(
      orderId: json['order_id'] ?? '',
      transactionStatus: json['transaction_status'] ?? '',
      transactionTime: json['transaction_time'] ?? '',
      paymentType: json['payment_type'] ?? '',
      fraudStatus: json['fraud_status'] ?? '',
      statusCode: json['status_code'] ?? '',
      statusMessage: json['status_message'] ?? '',
      grossAmount: json['gross_amount'] ?? '',
      isMock: json['_mock'] ?? false,
    );
  }

  bool get isSuccess =>
      transactionStatus == 'settlement' || transactionStatus == 'capture';
  bool get isPending => transactionStatus == 'pending';
  bool get isFailed =>
      transactionStatus == 'deny' ||
      transactionStatus == 'cancel' ||
      transactionStatus == 'expire';
}
