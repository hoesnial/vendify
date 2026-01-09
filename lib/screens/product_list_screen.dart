import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/product_service.dart';
import '../widgets/mcd_product_card.dart';
import '../theme/app_theme.dart';
import 'package:fluttertoast/fluttertoast.dart';
import '../providers/cart_provider.dart';
import 'prescription_scan_screen.dart';
import 'product_detail_screen.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'dart:async';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ProductListScreen extends StatefulWidget {
  const ProductListScreen({super.key});

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  final ProductService _productService = ProductService();
  List<Product> _filteredProducts = [];
  bool _isLoading = true;
  String? _errorMessage;

  // Connectivity
  bool _isOnline = false;
  bool _isCheckingConnection = false;
  StreamSubscription<ConnectivityResult>? _connectivitySubscription;

  @override
  void initState() {
    super.initState();
    _checkInitialConnectivity();
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((
      results,
    ) {
      _checkBackendConnection();
    });
    _loadProducts();
  }

  @override
  void dispose() {
    _connectivitySubscription?.cancel();
    super.dispose();
  }

  Future<void> _checkInitialConnectivity() async {
    await _checkBackendConnection();
  }

  Future<void> _checkBackendConnection() async {
    if (_isCheckingConnection) return;

    setState(() {
      _isCheckingConnection = true;
    });

    bool isConnected = false;
    try {
      final connectivityResult = await Connectivity().checkConnectivity();
      if (connectivityResult == ConnectivityResult.none) {
        isConnected = false;
      } else {
        // Try to reach backend
        try {
          // Use a simple HEAD or GET request to base URL or a known endpoint
          // Using a short timeout to fail fast
          final response = await http
              .get(
                Uri.parse(
                  ApiConfig.baseUrl + '/products',
                ), // Assuming this exists or just check root
                headers: ApiConfig.headers,
              )
              .timeout(const Duration(seconds: 5));

          if (response.statusCode >= 200 && response.statusCode < 500) {
            isConnected = true;
          }
        } catch (e) {
          debugPrint('Backend check failed: $e');
        }
      }
    } catch (e) {
      debugPrint('Connectivity check failed: $e');
    }

    if (mounted) {
      setState(() {
        _isOnline = isConnected;
        _isCheckingConnection = false;
      });

      // If we just came online, reload products
      if (isConnected && _filteredProducts.isEmpty) {
        _loadProducts();
      }
    }
  }

  Future<void> _loadProducts() async {
    if (_isLoading && _filteredProducts.isNotEmpty)
      return; // Prevent double loading

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final products = await _productService.getProducts();
      if (mounted) {
        setState(() {
          _filteredProducts = products;
          _isLoading = false;
          _isOnline = true; // If we got products, we are definitely online
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
          _isLoading = false;
        });
        // If loading failed, maybe we are offline
        _checkBackendConnection();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Clean Header with Search (scrolls with content)
            _buildModernHeader(),

            const SizedBox(height: 16),

            // Feature Cards (AI Assistant & Scan Prescription)
            // Feature Cards (Scan Voucher Only)
            _buildActionButtons(),
            // Products Section
            _buildProductsSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildModernHeader() {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.primary,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
      ),
      child: Column(
        children: [
          SafeArea(
            bottom: false,
            child: Column(
              children: [
                // Top Bar - Clean header with white text
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                  child: Row(
                    children: [
                      // MediVend Logo -> Vendify Icon (Shopping Bag)
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.shopping_bag_rounded,
                          color: AppTheme.primary,
                          size: 24,
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Greeting Text
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Vendify',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5,
                              ),
                            ),
                            Text(
                              'Snack favoritmu, sekali tap',
                              style: TextStyle(
                                color: Colors.white70,
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Connected Status
                      GestureDetector(
                        onTap:
                            _checkBackendConnection, // Tap to retry connection
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (_isCheckingConnection)
                                const Padding(
                                  padding: EdgeInsets.only(right: 6),
                                  child: SizedBox(
                                    width: 10,
                                    height: 10,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              Text(
                                _isOnline ? 'Online' : 'Offline',
                                style: TextStyle(
                                  color: _isOnline
                                      ? const Color.fromARGB(255, 4, 255, 0)
                                      : const Color.fromARGB(255, 255, 80, 80),
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Icon(
                                _isOnline ? Icons.wifi : Icons.wifi_off,
                                color: _isOnline
                                    ? const Color.fromARGB(255, 4, 255, 0)
                                    : const Color.fromARGB(255, 255, 80, 80),
                                size: 16,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Search Bar (outside SafeArea to allow proper scrolling)
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GestureDetector(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const PrescriptionScanScreen(),
            ),
          );
        },
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.cardColor,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.qr_code_scanner,
                  color: AppTheme.primary,
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    'Pindai Voucher',
                    style: TextStyle(
                      color: AppTheme.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Scan kode voucher untuk diskon',
                    style: TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProductsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Products Grid
        _isLoading
            ? const Center(
                child: Padding(
                  padding: EdgeInsets.all(40),
                  child: CircularProgressIndicator(color: AppTheme.primary),
                ),
              )
            : _errorMessage != null
            ? _buildErrorState()
            : _filteredProducts.isEmpty
            ? _buildEmptyState()
            : GridView.builder(
                padding: const EdgeInsets.fromLTRB(12, 0, 12, 120),
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.65,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: _filteredProducts.length,
                itemBuilder: (context, index) {
                  return McdProductCard(
                    product: _filteredProducts[index],
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ProductDetailScreen(
                            product: _filteredProducts[index],
                          ),
                        ),
                      );
                    },
                    onBuy: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => ProductDetailScreen(
                            product: _filteredProducts[index],
                          ),
                        ),
                      );
                    },
                  );
                },
              ),

        const SizedBox(height: 20),
      ],
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.signal_wifi_off, // Better icon for connection issues
              size: 80,
              color: AppTheme.errorRed.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'Gagal Memuat Produk',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              _isOnline
                  ? (_errorMessage ?? 'Terjadi kesalahan')
                  : 'Tidak ada koneksi internet',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                _checkBackendConnection();
                _loadProducts();
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Coba Lagi'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.inbox_outlined,
              size: 80,
              color: AppTheme.textSecondary.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'Tidak Ada Produk',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            const Text(
              'Produk akan muncul di sini',
              style: TextStyle(color: AppTheme.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}
