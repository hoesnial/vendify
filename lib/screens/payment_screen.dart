import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'dart:async';
import '../providers/cart_provider.dart';
import '../services/payment_service.dart';
import '../services/mqtt_service.dart';
import '../models/payment.dart';
import '../utils/helpers.dart';
import '../theme/app_theme.dart';
import 'home_screen.dart';
import 'midtrans_webview_screen.dart';

import '../models/cart_item.dart';

class PaymentScreen extends StatefulWidget {
  final List<CartItem>? directItems;
  final bool isBuyNow;

  const PaymentScreen({super.key, this.directItems, this.isBuyNow = false});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final PaymentService _paymentService = PaymentService();
  final MqttService _mqttService = MqttService();
  bool _isLoading = false;
  Payment? _payment;
  Timer? _statusTimer;
  String? _errorMessage;
  String? _selectedPaymentMethod; // null, 'qris', or 'midtrans'
  bool _isCheckingStatus = false; // New flag for status checking feedback
  StreamSubscription? _dispenseResultSubscription;

  @override
  void initState() {
    super.initState();
    // Don't create payment immediately, wait for payment method selection
    _initMqtt();
  }

  Future<void> _initMqtt() async {
    print('🔌 Initializing MQTT connection...');
    final connected = await _mqttService.connect();
    if (connected) {
      print('✅ MQTT connected successfully');
      _setupMqttListeners();
    } else {
      print('⚠️ MQTT connection failed - dispense may not work');
    }
  }

  void _setupMqttListeners() {
    // Listen for dispense results
    _dispenseResultSubscription = _mqttService.dispenseResultStream.listen(
      (result) {
        print('📦 Dispense result received: $result');
        final success = result['success'] as bool? ?? false;
        final orderId = result['orderId'] as String?;

        if (orderId == _payment?.orderId) {
          if (success) {
            print('✅ Product dispensed successfully!');
            // Show success in UI if needed
          } else {
            print('❌ Dispense failed: ${result['error']}');
            // Show error in UI if needed
          }
        }
      },
      onError: (error) {
        print('❌ Dispense stream error: $error');
      },
    );
  }

  @override
  void dispose() {
    _statusTimer?.cancel();
    _dispenseResultSubscription?.cancel();
    super.dispose();
  }

  // Helper to get items to process (either from cart or direct)
  List<CartItem> get _itemsToProcess {
    if (widget.directItems != null && widget.directItems!.isNotEmpty) {
      return widget.directItems!;
    }
    return Provider.of<CartProvider>(context, listen: false).items;
  }

  // Helper to get total price
  double get _totalPrice {
    if (widget.directItems != null && widget.directItems!.isNotEmpty) {
      return widget.directItems!.fold(0, (sum, item) => sum + item.totalPrice);
    }
    return Provider.of<CartProvider>(context, listen: false).totalPrice;
  }

  Future<void> _createPayment() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final itemsToBuy = _itemsToProcess;

      if (itemsToBuy.isEmpty) {
        setState(() {
          _errorMessage = 'Keranjang kosong';
          _isLoading = false;
        });
        return;
      }

      final itemsWithoutSlot = itemsToBuy
          .where((item) => item.product.slotId == null)
          .toList();
      if (itemsWithoutSlot.isNotEmpty) {
        setState(() {
          _errorMessage =
              'Produk tidak memiliki slot yang tersedia. Silakan refresh halaman produk.';
          _isLoading = false;
        });
        return;
      }

      final items = itemsToBuy
          .map(
            (item) => {
              'slot_id': item.product.slotId!,
              'quantity': item.quantity,
              'price': item.product.price,
            },
          )
          .toList();

      final payment = await _paymentService.createPayment(
        items: items,
        totalAmount: _totalPrice,
      );

      setState(() {
        _payment = payment;
        _isLoading = false;
      });

      _startStatusPolling();
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _createQrisPayment() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final itemsToBuy = _itemsToProcess;

      if (itemsToBuy.isEmpty) {
        setState(() {
          _errorMessage = 'Keranjang kosong';
          _isLoading = false;
        });
        return;
      }

      final itemsWithoutSlot = itemsToBuy
          .where((item) => item.product.slotId == null)
          .toList();
      if (itemsWithoutSlot.isNotEmpty) {
        setState(() {
          _errorMessage =
              'Produk tidak memiliki slot yang tersedia. Silakan refresh halaman produk.';
          _isLoading = false;
        });
        return;
      }

      final items = itemsToBuy
          .map(
            (item) => {
              'slot_id': item.product.slotId!,
              'quantity': item.quantity,
              'price': item.product.price,
            },
          )
          .toList();

      final payment = await _paymentService.createPayment(
        items: items,
        totalAmount: _totalPrice,
      );

      setState(() {
        _payment = payment;
        _isLoading = false;
      });

      _startStatusPolling();
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
        _selectedPaymentMethod = null;
      });
    }
  }

  Future<void> _createMidtransPayment() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final itemsToBuy = _itemsToProcess;

      if (itemsToBuy.isEmpty) {
        setState(() {
          _errorMessage = 'Keranjang kosong';
          _isLoading = false;
        });
        return;
      }

      final itemsWithoutSlot = itemsToBuy
          .where((item) => item.product.slotId == null)
          .toList();
      if (itemsWithoutSlot.isNotEmpty) {
        setState(() {
          _errorMessage =
              'Produk tidak memiliki slot yang tersedia. Silakan refresh halaman produk.';
          _isLoading = false;
        });
        return;
      }

      // STEP 1: Create order in backend first (for single item only for now)
      print('📦 Step 1: Creating order in backend...');
      final firstItem = itemsToBuy[0];
      final items = [
        {
          'slot_id': firstItem.product.slotId!,
          'quantity': firstItem.quantity,
          'price': firstItem.product.price,
        },
      ];

      final backendOrder = await _paymentService.createPayment(
        items: items,
        totalAmount: _totalPrice,
      );

      print('✅ Backend order created: ${backendOrder.orderId}');

      // STEP 2: Create Midtrans transaction with the same order ID
      print('📦 Step 2: Creating Midtrans transaction...');
      final paymentRequest = PaymentRequest(
        orderId: backendOrder.orderId,
        amount: _totalPrice,
        customerName: 'Customer',
        customerEmail: 'customer@example.com',
        items: itemsToBuy.map((item) {
          return PaymentItem(
            id: item.product.id.toString(),
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          );
        }).toList(),
      );

      final response = await _paymentService.createTransaction(paymentRequest);

      setState(() {
        _isLoading = false;
      });

      // STEP 3: Open Midtrans payment URL in WebView
      if (response.redirectUrl.isNotEmpty) {
        print('🌐 Opening Midtrans WebView: ${response.redirectUrl}');

        setState(() {
          _payment = backendOrder; // Save payment info
        });

        // Navigate to WebView screen and wait for result
        final result = await Navigator.push<String>(
          context,
          MaterialPageRoute(
            builder: (context) => MidtransWebViewScreen(
              paymentUrl: response.redirectUrl,
              orderId: backendOrder.orderId,
            ),
          ),
        );

        print('💳 Payment result: $result');

        // Handle payment result
        if (result == 'success') {
          // SUCCESS: Manually update payment status in backend (webhook workaround)
          print(
            '✅ WebView detected success - triggering manual backend update...',
          );

          setState(() {
            _isCheckingStatus = true;
          });

          try {
            final updated = await _paymentService.manualUpdatePaymentStatus(
              backendOrder.orderId,
              status: 'SUCCESS',
            );

            if (updated) {
              print('✅ Backend payment status updated successfully');
            } else {
              print('⚠️ Manual update returned false, but continuing...');
            }
          } catch (e) {
            print('⚠️ Manual update error (non-critical): $e');
          }

          // Small delay to let backend process the update
          await Future.delayed(const Duration(seconds: 1));

          // Start polling to verify and get final status
          _startStatusPolling();
        } else if (result == 'pending') {
          // PENDING: Start polling without manual update
          _startStatusPolling();
        } else if (result == 'failed' || result == 'cancelled') {
          setState(() {
            _errorMessage = result == 'cancelled'
                ? 'Pembayaran dibatalkan'
                : 'Pembayaran gagal';
            _selectedPaymentMethod = null;
            _payment = null;
          });
        }
      } else {
        throw Exception('No redirect URL received');
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
        _selectedPaymentMethod = null;
      });
    }
  }

  void _startStatusPolling() {
    int pollCount = 0;
    const maxPolls = 40; // 40 * 3s = 2 minutes max polling

    // Show checking status indicator
    setState(() {
      _isCheckingStatus = true;
    });

    _statusTimer = Timer.periodic(const Duration(seconds: 3), (timer) async {
      if (_payment == null) {
        timer.cancel();
        setState(() {
          _isCheckingStatus = false;
        });
        return;
      }

      pollCount++;
      print('🔄 Polling payment status... (attempt $pollCount/$maxPolls)');

      // Stop after max attempts
      if (pollCount >= maxPolls) {
        print('⏰ Max polling attempts reached');
        timer.cancel();
        if (mounted) {
          setState(() {
            _isCheckingStatus = false;
            _errorMessage =
                'Timeout: Tidak dapat memverifikasi status pembayaran. Cek riwayat pesanan.';
          });
        }
        return;
      }

      try {
        final status = await _paymentService.checkPaymentStatus(
          _payment!.orderId,
        );

        print('💳 Current payment status: $status');

        // Success statuses
        if (status == 'settlement' ||
            status == 'capture' ||
            status == 'success') {
          print('✅ Payment successful!');
          timer.cancel();
          setState(() {
            _isCheckingStatus = false;
          });
          _handlePaymentSuccess();
        }
        // Failed statuses
        else if (status == 'deny' ||
            status == 'cancel' ||
            status == 'expire' ||
            status == 'failure') {
          print('❌ Payment failed: $status');
          timer.cancel();
          setState(() {
            _isCheckingStatus = false;
          });
          _handlePaymentFailed(status);
        }
        // Pending statuses - continue polling
        else if (status == 'pending' || status == 'challenge') {
          print('⏳ Payment still pending, continuing to poll...');
          // Continue polling
        }
      } catch (e) {
        print('❌ Error polling payment status: $e');
        // Continue polling on error - don't stop on network issues
      }
    });
  }

  void _handlePaymentSuccess() {
    final cartProvider = Provider.of<CartProvider>(context, listen: false);

    // Navigate to dispensing screen
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (context) => _DispensingScreen(
          orderId: _payment!.orderId,
          items: _itemsToProcess,
          cartProvider: cartProvider,
          mqttService: _mqttService,
          // IMPORTANT: Only clear cart if this was NOT a Buy Now (direct) purchase
          shouldClearCart: !widget.isBuyNow,
        ),
      ),
    );
  }

  void _handlePaymentFailed(String status) {
    if (!mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.error, color: Colors.red, size: 32),
            SizedBox(width: 8),
            Text('Pembayaran Gagal'),
          ],
        ),
        content: Text('Status: $status\nSilakan coba lagi.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              Navigator.of(context).pop();
            },
            child: const Text('Kembali'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              _createPayment();
            },
            child: const Text('Coba Lagi'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        backgroundColor: AppTheme.backgroundColor,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Kasir Snack',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppTheme.primary),
            )
          : _errorMessage != null
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.error_outline,
                    size: 60,
                    color: AppTheme.primary,
                  ),
                  const SizedBox(height: 16),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Text(
                      _errorMessage!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () {
                      setState(() {
                        _errorMessage = null;
                        _selectedPaymentMethod = null;
                      });
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 16,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(9999),
                      ),
                    ),
                    child: const Text(
                      'Coba Lagi',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            )
          : _payment == null
          ? _buildPaymentMethodSelection()
          : _buildPaymentDetails(),
    );
  }

  Widget _buildPaymentMethodSelection() {
    // Determine whether to show direct items or cart items
    final itemsToDisplay = _itemsToProcess;

    return Stack(
      children: [
        SingleChildScrollView(
          padding: const EdgeInsets.only(bottom: 140),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Order Summary Section
              const Padding(
                padding: EdgeInsets.fromLTRB(16, 20, 16, 12),
                child: Text(
                  'Jajanan Kamu',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ),

              // Order Items List
              ...itemsToDisplay.map((item) {
                return Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  decoration: const BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: Color(0xFFE2E8F0), width: 1),
                    ),
                  ),
                  child: Row(
                    children: [
                      // Product Image
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child:
                            (item.product.imageUrl != null &&
                                item.product.imageUrl!.isNotEmpty)
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.network(
                                  Helpers.getImageUrl(item.product.imageUrl),
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return const Icon(
                                      Icons.image_not_supported,
                                      color: Colors.grey,
                                    );
                                  },
                                ),
                              )
                            : const Icon(Icons.local_cafe, color: Colors.grey),
                      ),
                      const SizedBox(width: 16),
                      // Product Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.product.name,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                                color: AppTheme.textPrimary,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${item.quantity}x',
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Price
                      Text(
                        Helpers.formatCurrency(
                          item.product.price * item.quantity,
                        ),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),

              // Cost Breakdown
              Padding(
                padding: const EdgeInsets.all(16),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Subtotal',
                            style: TextStyle(
                              fontSize: 14,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                          Text(
                            Helpers.formatCurrency(_totalPrice),
                            style: const TextStyle(
                              fontSize: 14,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Pajak & Biaya',
                            style: TextStyle(
                              fontSize: 14,
                              color: AppTheme.textSecondary,
                            ),
                          ),
                          Text(
                            Helpers.formatCurrency(0),
                            style: const TextStyle(
                              fontSize: 14,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ],
                      ),
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        child: Divider(color: Color(0xFFE2E8F0)),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Total',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          Text(
                            Helpers.formatCurrency(_totalPrice),
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              // Payment Method Section
              const Padding(
                padding: EdgeInsets.fromLTRB(16, 16, 16, 12),
                child: Text(
                  'Pilih Metode Pembayaran',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ),

              // Payment Methods
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Column(
                  children: [
                    _buildModernPaymentOption(
                      title: 'QRIS',
                      logoPath: 'assets/images/qris-logo.png',
                      isSelected: _selectedPaymentMethod == 'qris',
                      onTap: () {
                        setState(() {
                          _selectedPaymentMethod = 'qris';
                        });
                      },
                    ),
                    const SizedBox(height: 12),
                    _buildModernPaymentOption(
                      title: 'GoPay',
                      logoPath: 'assets/images/gopay-logo.png',
                      isSelected: _selectedPaymentMethod == 'gopay',
                      onTap: () {
                        setState(() {
                          _selectedPaymentMethod = 'gopay';
                        });
                      },
                    ),
                    const SizedBox(height: 12),
                    _buildModernPaymentOption(
                      title: 'ShopeePay',
                      logoPath: 'assets/images/shopeepay-logo.png',
                      isSelected: _selectedPaymentMethod == 'shopeepay',
                      onTap: () {
                        setState(() {
                          _selectedPaymentMethod = 'shopeepay';
                        });
                      },
                    ),
                    const SizedBox(height: 12),
                    _buildModernPaymentOption(
                      title: 'Transfer Bank',
                      logoPath: 'assets/images/bank-logo.jpg',
                      isSelected: _selectedPaymentMethod == 'bank',
                      onTap: () {
                        setState(() {
                          _selectedPaymentMethod = 'bank';
                        });
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        // Fixed Bottom Bar
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: AppTheme.backgroundColor,
              border: Border(
                top: BorderSide(color: Color(0xFFE2E8F0), width: 1),
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _selectedPaymentMethod == null
                        ? null
                        : () {
                            if (_selectedPaymentMethod == 'qris') {
                              _createQrisPayment();
                            } else {
                              _createMidtransPayment();
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      disabledBackgroundColor: AppTheme.textSecondary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(9999),
                      ),
                    ),
                    child: const Text(
                      'Konfirmasi',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.lock, size: 14, color: AppTheme.textSecondary),
                    SizedBox(width: 8),
                    Text(
                      'Pembayaran Aman',
                      style: TextStyle(
                        fontSize: 12,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildModernPaymentOption({
    required String title,
    String? logoPath,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primary.withOpacity(0.1) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppTheme.primary : const Color(0xFFE2E8F0),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            if (logoPath != null)
              Container(
                width: 40,
                height: 24,
                child: Image.asset(
                  logoPath,
                  fit: BoxFit.contain,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: AppTheme.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    );
                  },
                ),
              )
            else
              Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: AppTheme.textPrimary,
                ),
              ),
            ),
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected
                      ? AppTheme.primary
                      : const Color(0xFFCBD5E0),
                  width: 2,
                ),
                color: isSelected ? AppTheme.primary : Colors.transparent,
              ),
              child: isSelected
                  ? const Icon(Icons.check, size: 14, color: Colors.white)
                  : null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentDetails() {
    // For QRIS, show QR code
    if (_selectedPaymentMethod == 'qris' && _payment!.qrCode.isNotEmpty) {
      final cartProvider = Provider.of<CartProvider>(context);

      return SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: const LinearGradient(
                    colors: [Colors.white, Color(0xFFFFF5F5)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const Icon(
                      Icons.qr_code_scanner,
                      size: 48,
                      color: AppTheme.primaryBlue,
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Scan QR Code untuk membayar',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.darkBlue,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: AppTheme.primaryBlue,
                          width: 3,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primaryBlue.withOpacity(0.2),
                            blurRadius: 10,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: QrImageView(
                        data: _payment!.qrCode,
                        version: QrVersions.auto,
                        size: 250,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.accentBlue,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        children: [
                          const Text(
                            'Total Pembayaran',
                            style: TextStyle(
                              fontSize: 14,
                              color: AppTheme.darkBlue,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            Helpers.formatCurrency(_payment!.amount),
                            style: const TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.darkBlue,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Order ID: ${_payment!.orderId}',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            Card(
              color: AppTheme.primaryBlue,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    ),
                    SizedBox(width: 12),
                    Text(
                      _isCheckingStatus
                          ? 'Mengecek status pembayaran...'
                          : 'Menunggu pembayaran...',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Detail Pesanan',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.darkBlue,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: cartProvider.items.length,
                separatorBuilder: (context, index) => const Divider(),
                itemBuilder: (context, index) {
                  final item = cartProvider.items[index];
                  return ListTile(
                    title: Text(
                      item.product.name,
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                    subtitle: Text(
                      '${item.quantity} x ${Helpers.formatCurrency(item.product.price)}',
                    ),
                    trailing: Text(
                      Helpers.formatCurrency(
                        item.product.price * item.quantity,
                      ),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryBlue,
                        fontSize: 16,
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      );
    }

    // For Midtrans, show waiting message with modern design
    return Container(
      color: AppTheme.backgroundColor,
      child: Column(
        children: [
          Expanded(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Animated EKG Line
                    const _EKGAnimation(),
                    const SizedBox(height: 48),
                    // Status Title
                    const Text(
                      'Memverifikasi Pembayaran',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                        letterSpacing: -0.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    // Status Description
                    const Text(
                      'Transaksi Anda sedang diproses dengan aman.\nIni hanya akan memakan waktu sebentar.',
                      style: TextStyle(
                        fontSize: 16,
                        color: AppTheme.textSecondary,
                        height: 1.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
          ),
          // Bottom Section
          Padding(
            padding: const EdgeInsets.only(bottom: 32, top: 16),
            child: Column(
              children: [
                // Security Badge
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(
                      Icons.lock_outline,
                      size: 18,
                      color: AppTheme.textSecondary,
                    ),
                    SizedBox(width: 8),
                    Text(
                      'Terenkripsi SSL',
                      style: TextStyle(
                        fontSize: 14,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // Cancel Button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: TextButton(
                      onPressed: () {
                        _statusTimer?.cancel();
                        Navigator.of(context).pop();
                      },
                      style: TextButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        foregroundColor: AppTheme.textPrimary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'Batal',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Animated EKG Widget
class _EKGAnimation extends StatefulWidget {
  const _EKGAnimation({Key? key}) : super(key: key);

  @override
  State<_EKGAnimation> createState() => _EKGAnimationState();
}

class _EKGAnimationState extends State<_EKGAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return SizedBox(
          width: 250,
          height: 80,
          child: CustomPaint(
            painter: _EKGPainter(
              progress: _controller.value,
              color: AppTheme.primary,
            ),
          ),
        );
      },
    );
  }
}

// Custom painter for EKG-style animation
class _EKGPainter extends CustomPainter {
  final double progress;
  final Color color;

  _EKGPainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;

    final path = Path();
    final width = size.width;
    final height = size.height;
    final centerY = height / 2;

    // EKG pattern points
    final points = [
      Offset(0, centerY),
      Offset(width * 0.2, centerY),
      Offset(width * 0.25, centerY - 20),
      Offset(width * 0.3, centerY + 30),
      Offset(width * 0.35, centerY - 5),
      Offset(width * 0.4, centerY),
      Offset(width * 0.5, centerY),
      Offset(width * 0.55, centerY + 10),
      Offset(width * 0.6, centerY - 10),
      Offset(width * 0.65, centerY),
      Offset(width, centerY),
    ];

    // Calculate visible portion based on progress
    final totalLength = points.length - 1;
    final visibleLength = totalLength * progress;
    final visiblePoints = visibleLength.floor();

    if (visiblePoints > 0) {
      path.moveTo(points[0].dx, points[0].dy);
      for (int i = 1; i <= visiblePoints && i < points.length; i++) {
        path.lineTo(points[i].dx, points[i].dy);
      }

      // Partial segment for smooth animation
      if (visiblePoints < points.length - 1) {
        final fraction = visibleLength - visiblePoints;
        final prev = points[visiblePoints];
        final next = points[visiblePoints + 1];
        final partial = Offset(
          prev.dx + (next.dx - prev.dx) * fraction,
          prev.dy + (next.dy - prev.dy) * fraction,
        );
        path.lineTo(partial.dx, partial.dy);
      }
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(_EKGPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}

// Dispensing Screen
class _DispensingScreen extends StatefulWidget {
  final String orderId;
  final List<CartItem> items;
  final CartProvider cartProvider;
  final MqttService mqttService;
  final bool shouldClearCart;

  const _DispensingScreen({
    Key? key,
    required this.orderId,
    required this.items,
    required this.cartProvider,
    required this.mqttService,
    this.shouldClearCart = true,
  }) : super(key: key);

  @override
  State<_DispensingScreen> createState() => _DispensingScreenState();
}

class _DispensingScreenState extends State<_DispensingScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _progressController;
  int _currentItemIndex = 0;
  bool _isWaitingForConfirmation = false;
  int _currentStep = 1; // 1=Payment, 2=Sending Command, 3=Dispensed
  StreamSubscription? _dispenseSubscription;

  // Track dispensed quantity for current item
  int _currentQuantityDispensed = 0;

  @override
  void initState() {
    super.initState();
    _progressController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();

    // Listen for dispense result
    _dispenseSubscription = widget.mqttService.dispenseResultStream.listen((
      result,
    ) {
      final success = result['success'] as bool? ?? false;
      final orderId = result['orderId'] as String?;

      if (orderId == widget.orderId && success) {
        _handleDispenseSuccess();
      }
    });

    // Start dispensing first item after a short delay
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        _processNextDispense();
      }
    });
  }

  void _processNextDispense() {
    if (_currentItemIndex >= widget.items.length) {
      // All items dispensed
      setState(() {
        _currentStep = 3;
      });
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          if (widget.shouldClearCart) {
            widget.cartProvider.clear();
          }
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (context) => const _PurchaseCompleteScreen(),
            ),
          );
        }
      });
      return;
    }

    // Get current item to dispense
    final currentItem = widget.items[_currentItemIndex];

    // Check if we need to dispense more of this item (quantity > 1)
    if (_currentQuantityDispensed < currentItem.quantity) {
      setState(() {
        _currentStep = 2;
        _isWaitingForConfirmation = true;
      });

      // Send MQTT command
      print(
        '📤 Dispensing item ${_currentItemIndex + 1}/${widget.items.length} (Qty: ${_currentQuantityDispensed + 1}/${currentItem.quantity})',
      );
      widget.mqttService.publishDispenseCommand(
        orderId: widget.orderId,
        slot: currentItem.product.slotId!,
      );
    } else {
      // Done with this item, move to next
      _currentItemIndex++;
      _currentQuantityDispensed = 0;
      _processNextDispense();
    }
  }

  void _handleDispenseSuccess() {
    if (!_isWaitingForConfirmation) return;

    setState(() {
      _isWaitingForConfirmation = false;
      _currentQuantityDispensed++;
    });

    // Wait a bit before next dispense to avoid jamming
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        _processNextDispense();
      }
    });
  }

  @override
  void dispose() {
    _progressController.dispose();
    _dispenseSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final baseProgress = (_currentStep - 1) / 3.0;
    final nextProgress = _currentStep / 3.0;
    final animatedProgress =
        baseProgress +
        (nextProgress - baseProgress) *
            Curves.easeInOut.transform(_progressController.value);

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        backgroundColor: AppTheme.backgroundColor,
        elevation: 0,
        centerTitle: true,
        automaticallyImplyLeading: false,
        title: const Text(
          'Dispensing Item Anda',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Progress Circle
                AnimatedBuilder(
                  animation: _progressController,
                  builder: (context, child) {
                    return SizedBox(
                      width: 200,
                      height: 200,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          // Background circle
                          SizedBox(
                            width: 200,
                            height: 200,
                            child: CircularProgressIndicator(
                              value: 1.0,
                              strokeWidth: 10,
                              color: AppTheme.primary.withOpacity(0.2),
                            ),
                          ),
                          // Progress circle
                          SizedBox(
                            width: 200,
                            height: 200,
                            child: CircularProgressIndicator(
                              value: animatedProgress,
                              strokeWidth: 10,
                              color: AppTheme.primary,
                            ),
                          ),
                          // Center text
                          Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                '${(animatedProgress * 100).toInt()}%',
                                style: const TextStyle(
                                  fontSize: 40,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Dispensing...',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
                const SizedBox(height: 48),
                // Steps Timeline
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32),
                  child: Column(
                    children: [
                      _buildStep(
                        stepNumber: 1,
                        icon: Icons.check_circle,
                        title: 'Pembayaran Terverifikasi',
                        subtitle: 'Pembayaran Anda berhasil.',
                        isCompleted: _currentStep >= 1,
                        isActive: _currentStep == 1,
                      ),
                      _buildStep(
                        stepNumber: 2,
                        icon: Icons.signal_cellular_alt,
                        title: 'Mengirim Perintah ke Mesin',
                        subtitle: 'Menghubungkan ke perangkat...',
                        isCompleted: _currentStep >= 2,
                        isActive: _currentStep == 2,
                      ),
                      _buildStep(
                        stepNumber: 3,
                        icon: Icons.inventory_2_outlined,
                        title: 'Item Dispensed',
                        subtitle: 'Menunggu konfirmasi mesin.',
                        isCompleted: _currentStep >= 3,
                        isActive: _currentStep == 3,
                        isLast: true,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Bottom button
          Padding(
            padding: const EdgeInsets.only(left: 24, right: 24, bottom: 24),
            child: Column(
              children: [
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: OutlinedButton(
                    onPressed: () {
                      // Show help dialog
                      showDialog(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          title: const Text('Ada Masalah?'),
                          content: const Text(
                            'Jika produk tidak keluar dalam 30 detik, silakan hubungi customer service.',
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.of(ctx).pop(),
                              child: const Text('OK'),
                            ),
                          ],
                        ),
                      );
                    },
                    style: OutlinedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      side: BorderSide(
                        color: AppTheme.textSecondary.withOpacity(0.3),
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(9999),
                      ),
                    ),
                    child: const Text(
                      'Ada Masalah?',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                // Dev/Test Button to Force Success
                TextButton(
                  onPressed: () {
                    // Send fake signal via MQTT so Backend can decrement stock
                    if (_currentItemIndex < widget.items.length) {
                      final item = widget.items[_currentItemIndex];
                      widget.mqttService.publishSimulatedDispenseResult(
                        orderId: widget.orderId,
                        slot: item.product.slotId!,
                      );
                    }
                  },
                  child: const Text(
                    'Simulasi Sukses (Dev Only)',
                    style: TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStep({
    required int stepNumber,
    required IconData icon,
    required String title,
    required String subtitle,
    required bool isCompleted,
    required bool isActive,
    bool isLast = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Icon column
        Column(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: isCompleted
                    ? AppTheme.primary
                    : AppTheme.primary.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isCompleted ? Icons.check : icon,
                color: isCompleted
                    ? Colors.white
                    : AppTheme.primary.withOpacity(0.7),
                size: 18,
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 48,
                color: isCompleted
                    ? AppTheme.primary
                    : AppTheme.primary.withOpacity(0.2),
              ),
          ],
        ),
        const SizedBox(width: 16),
        // Text column
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 4, bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: isCompleted || isActive
                        ? AppTheme.textPrimary
                        : AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 14,
                    color: isCompleted || isActive
                        ? AppTheme.textSecondary
                        : AppTheme.textSecondary.withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// Purchase Complete Screen
class _PurchaseCompleteScreen extends StatelessWidget {
  const _PurchaseCompleteScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        backgroundColor: AppTheme.backgroundColor,
        elevation: 0,
        centerTitle: true,
        automaticallyImplyLeading: false,
        title: const Text(
          'Sukses',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Success Icon
                Container(
                  width: 160,
                  height: 160,
                  decoration: BoxDecoration(
                    color: AppTheme.primary.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check_circle,
                    size: 120,
                    color: AppTheme.primary,
                  ),
                ),
                const SizedBox(height: 32),
                // Title
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 32),
                  child: Text(
                    'Pembelian Selesai',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                      letterSpacing: -0.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 16),
                // Subtitle
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 32),
                  child: Text(
                    'Silakan ambil item Anda dari baki.',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppTheme.textSecondary,
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ),
          ),
          // Back to Home button
          Padding(
            padding: const EdgeInsets.all(32),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(
                      builder: (context) =>
                          const HomeScreen(initialTabIndex: 0),
                    ),
                    (route) => false,
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Kembali ke Beranda',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
