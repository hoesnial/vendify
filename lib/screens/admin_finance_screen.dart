import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../services/auth_service.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/api_config.dart';

class AdminFinanceScreen extends StatefulWidget {
  const AdminFinanceScreen({super.key});

  @override
  State<AdminFinanceScreen> createState() => _AdminFinanceScreenState();
}

class _AdminFinanceScreenState extends State<AdminFinanceScreen> {
  final TextEditingController _searchController = TextEditingController();
  final _authService = AuthService();
  String _selectedPeriod = 'month';
  String _selectedFilter = 'all';
  bool _isLoading = true;

  // Stats data (will be loaded from API)
  Map<String, dynamic> _stats = {
    'totalRevenue': 0.0,
    'revenueChange': 0,
    'totalExpenses': 0.0,
    'expensesChange': 0,
    'netProfit': 0.0,
    'profitChange': 0,
    'avgTxValue': 0.0,
    'avgChange': 0,
    'totalTransactions': 0,
    'txChange': 0,
    'successRate': 0,
    'rateChange': 0.0,
    'activeAlerts': 0,
  };

  // Transaction list (will be loaded from API)
  List<Map<String, dynamic>> _transactions = [];

  @override
  void initState() {
    super.initState();
    _loadFinancialData();
  }

  Future<void> _loadFinancialData() async {
    setState(() => _isLoading = true);

    try {
      final token = _authService.token;

      if (token == null) {
        throw Exception('Admin token not found');
      }

      // Fetch financial stats and transactions in parallel
      await Future.wait([
        _loadFinancialStats(token),
        _loadTransactions(token),
      ]);

      print('✅ Successfully loaded financial data');
    } catch (e) {
      print('❌ Error loading financial data: $e');
      _loadMockData();
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadFinancialStats(String token) async {
    try {
      // Use the same endpoint as frontend web
      final url = Uri.parse('${ApiConfig.baseUrl}/orders/machine/VM01?limit=100');

      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(ApiConfig.connectionTimeout);

      print('Orders Machine Response for Stats: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final ordersList = (data['orders'] ?? data['data'] ?? []) as List;

        // Calculate stats from orders
        double totalRevenue = 0;
        int completedCount = 0;
        int totalCount = ordersList.length;

        for (var order in ordersList) {
          final amount = (order['total_amount'] ?? 0).toDouble();
          final status = (order['status'] ?? '').toString().toUpperCase();

          if (status == 'COMPLETED' || status == 'SUCCESS') {
            totalRevenue += amount;
            completedCount++;
          }
        }

        final avgTx = completedCount > 0 ? totalRevenue / completedCount : 0;
        final successRate = totalCount > 0 ? (completedCount / totalCount * 100).round() : 0;

        setState(() {
          _stats = {
            'totalRevenue': totalRevenue,
            'revenueChange': 12, // Mock
            'totalExpenses': totalRevenue * 0.35, // Mock: 35% of revenue
            'expensesChange': 5, // Mock
            'netProfit': totalRevenue * 0.65, // Mock: 65% profit
            'profitChange': 15, // Mock
            'avgTxValue': avgTx,
            'avgChange': 2, // Mock
            'totalTransactions': totalCount,
            'txChange': 5, // Mock
            'successRate': successRate,
            'rateChange': 0.2, // Mock
            'activeAlerts': 0,
          };
        });

        print('Calculated stats from ${totalCount} orders');
        print('Total Revenue: \$${totalRevenue.toStringAsFixed(2)}');
        print('Completed: $completedCount, Success Rate: $successRate%');
      } else {
        throw Exception('HTTP ${response.statusCode}: Orders endpoint error');
      }
    } catch (e) {
      print('Error loading stats: $e');
      throw e;
    }
  }

  Future<void> _loadTransactions(String token) async {
    try {
      // Use the same endpoint as frontend web
      final url = Uri.parse('${ApiConfig.baseUrl}/orders/machine/VM01?limit=50');

      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(ApiConfig.connectionTimeout);

      print('Orders Machine Response: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final ordersList = (data['orders'] ?? data['data'] ?? []) as List;

        setState(() {
          _transactions = ordersList.map((order) {
            // Get product name from order
            final productName = order['product_name'] ?? 
                               (order['items'] is List && (order['items'] as List).isNotEmpty 
                                 ? (order['items'][0]['product_name'] ?? 'Unknown Item')
                                 : 'Multiple Items');
            
            // Get quantity
            final quantity = order['quantity'] ?? 
                           order['total_quantity'] ?? 
                           (order['items'] is List ? (order['items'] as List).length : 1);
            
            return {
              'id': order['order_id'] ?? order['id'] ?? 'TX-0000',
              'product': productName,
              'quantity': quantity,
              'amount': (order['total_amount'] ?? 0).toDouble(),
              'date': order['created_at'] ?? DateTime.now().toIso8601String(),
              'status': _mapOrderStatus(order['status'] ?? 'PENDING'),
              'paymentMethod': _formatPaymentMethod(order['payment_method'] ?? order['payment_type'] ?? 'QRIS'),
              'icon': _getProductIcon(productName),
              'iconBg': _getIconBackground(_mapOrderStatus(order['status'] ?? 'PENDING')),
              'iconColor': _getIconColor(_mapOrderStatus(order['status'] ?? 'PENDING')),
            };
          }).toList();
        });

        print('Loaded ${_transactions.length} transactions from orders');
      } else {
        throw Exception('HTTP ${response.statusCode}: Orders endpoint error');
      }
    } catch (e) {
      print('Error loading transactions: $e');
      throw e;
    }
  }

  String _mapOrderStatus(String status) {
    final s = status.toUpperCase();
    if (s == 'COMPLETED' || s == 'SUCCESS' || s == 'SETTLEMENT' || s == 'PAID') {
      return 'success';
    } else if (s == 'FAILED' || s == 'CANCELLED' || s == 'DENY' || s == 'EXPIRE') {
      return 'failed';
    } else {
      return 'syncing'; // PENDING, PROCESSING, DISPENSING, etc
    }
  }

  String _formatPaymentMethod(String method) {
    final m = method.toLowerCase();
    if (m.contains('qris')) return 'QRIS';
    if (m.contains('gopay')) return 'GoPay';
    if (m.contains('shopeepay')) return 'ShopeePay';
    if (m.contains('va') || m.contains('bank')) return 'Virtual Account';
    if (m.contains('credit') || m.contains('debit')) return 'Card';
    return method;
  }

  IconData _getProductIcon(String productName) {
    final name = productName.toLowerCase();
    if (name.contains('ibuprofen') || name.contains('paracetamol') ||
        name.contains('aspirin')) {
      return Icons.medical_services;
    } else if (name.contains('sanitizer')) {
      return Icons.sanitizer;
    } else if (name.contains('bandage') || name.contains('plaster')) {
      return Icons.healing;
    } else if (name.contains('mask')) {
      return Icons.masks;
    }
    return Icons.medical_services;
  }

  Color _getIconBackground(String status) {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return const Color(0xFFDEEBFF);
      case 'failed':
      case 'cancelled':
        return const Color(0xFFFEE2E2);
      case 'pending':
      case 'syncing':
        return const Color(0xFFF3F4F6);
      default:
        return const Color(0xFFF3F4F6);
    }
  }

  Color _getIconColor(String status) {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return const Color(0xFF3B82F6);
      case 'failed':
      case 'cancelled':
        return const Color(0xFFEF4444);
      case 'pending':
      case 'syncing':
        return const Color(0xFF6B7280);
      default:
        return const Color(0xFF6B7280);
    }
  }

  void _loadMockData() {
    setState(() {
      _stats = {
        'totalRevenue': 12450.00,
        'revenueChange': 12,
        'totalExpenses': 4200.00,
        'expensesChange': 5,
        'netProfit': 8250.00,
        'profitChange': 15,
        'avgTxValue': 15.50,
        'avgChange': 2,
        'totalTransactions': 24,
        'txChange': 5,
        'successRate': 98,
        'rateChange': 0.2,
        'activeAlerts': 1,
      };

      _transactions = [
        {
          'id': 'TX-9921',
          'product': 'Ibuprofen',
          'quantity': 1,
          'amount': 8.00,
          'date': '2025-12-17T20:48:00',
          'status': 'syncing',
          'paymentMethod': 'QRIS',
          'icon': Icons.medical_services,
          'iconBg': const Color(0xFFF3F4F6),
          'iconColor': const Color(0xFF6B7280),
        },
        {
          'id': 'TX-9920',
          'product': 'Hand Sanitizer',
          'quantity': 2,
          'amount': 12.50,
          'date': '2025-12-17T19:12:00',
          'status': 'success',
          'paymentMethod': 'Visa ••4242',
          'icon': Icons.sanitizer,
          'iconBg': const Color(0xFFDEEBFF),
          'iconColor': const Color(0xFF3B82F6),
        },
        {
          'id': 'TX-9919',
          'product': 'Bandages',
          'quantity': 1,
          'amount': 5.00,
          'date': '2025-12-17T18:45:00',
          'status': 'failed',
          'paymentMethod': 'Apple Pay',
          'icon': Icons.healing,
          'iconBg': const Color(0xFFFEE2E2),
          'iconColor': const Color(0xFFEF4444),
        },
      ];
    });

    print('⚠️  Using mock financial data');
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark
          ? const Color(0xFF0F2323)
          : const Color(0xFFFAFAFA),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadFinancialData,
          child: CustomScrollView(
            slivers: [
              // Header
              _buildHeader(isDark),

              // Financial Overview
              _buildFinancialOverview(isDark),

              // Transaction Log
              _buildTransactionLog(isDark),

              // Bottom spacing
              SliverToBoxAdapter(child: const SizedBox(height: 100)),
            ],
          ),
        ),
      ),
    );
  }

  SliverToBoxAdapter _buildHeader(bool isDark) {
    return SliverToBoxAdapter(
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 24, 20, 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Breadcrumb
            Row(
              children: [
                Text(
                  'Admin',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: isDark
                        ? const Color(0xFF6B8A8A)
                        : const Color(0xFF6B8A8A),
                  ),
                ),
                const SizedBox(width: 6),
                Icon(
                  Icons.chevron_right,
                  size: 14,
                  color: isDark
                      ? const Color(0xFF6B8A8A)
                      : const Color(0xFF6B8A8A),
                ),
                const SizedBox(width: 6),
                Text(
                  'Finance & Logs',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: isDark
                        ? const Color(0xFF00A8A8)
                        : const Color(0xFF00A8A8),
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF162E2E) : Colors.white,
                    border: Border.all(
                      color: isDark
                          ? const Color(0xFF1F3B3B)
                          : const Color(0xFFEEF2F2),
                    ),
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 2,
                      ),
                    ],
                  ),
                  child: Stack(
                    children: [
                      Icon(
                        Icons.notifications_outlined,
                        size: 20,
                        color: isDark
                            ? const Color(0xFF6B8A8A)
                            : const Color(0xFF6B8A8A),
                      ),
                      Positioned(
                        top: 0,
                        right: 2,
                        child: Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: Color(0xFFEF4444),
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Title
            Text(
              'Financial Overview',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white : const Color(0xFF0C1D1D),
                letterSpacing: -0.5,
                height: 1.2,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Last updated: Just now',
              style: TextStyle(
                fontSize: 12,
                color: isDark
                    ? const Color(0xFF6B8A8A)
                    : const Color(0xFF6B8A8A),
              ),
            ),
          ],
        ),
      ),
    );
  }

  SliverToBoxAdapter _buildFinancialOverview(bool isDark) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          children: [
            // Period Selector
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: isDark
                    ? const Color(0xFF1F3B3B)
                    : const Color(0xFFE5E7EB),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  _buildPeriodButton('This Month', 'month', isDark),
                  _buildPeriodButton('Today', 'today', isDark),
                  _buildPeriodButton('Week', 'week', isDark),
                  _buildPeriodButton('Year', 'year', isDark),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Stats Grid
            GridView.count(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildStatCard(
                  'Total Revenue',
                  '\$${_stats['totalRevenue'].toStringAsFixed(2)}',
                  _stats['revenueChange'],
                  Icons.attach_money,
                  const Color(0xFF00A8A8),
                  isDark,
                ),
                _buildStatCard(
                  'Total Expenses',
                  '\$${_stats['totalExpenses'].toStringAsFixed(2)}',
                  _stats['expensesChange'],
                  Icons.money_off,
                  const Color(0xFFF97316),
                  isDark,
                  isNegative: true,
                ),
                _buildStatCard(
                  'Net Profit',
                  '\$${_stats['netProfit'].toStringAsFixed(2)}',
                  _stats['profitChange'],
                  Icons.account_balance_wallet,
                  const Color(0xFF10B981),
                  isDark,
                ),
                _buildStatCard(
                  'Avg. Tx Value',
                  '\$${_stats['avgTxValue'].toStringAsFixed(2)}',
                  _stats['avgChange'],
                  Icons.receipt,
                  const Color(0xFF3B82F6),
                  isDark,
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Revenue Chart (Simplified)
            _buildRevenueChart(isDark),

            const SizedBox(height: 16),

            // Expense Breakdown
            _buildExpenseBreakdown(isDark),
          ],
        ),
      ),
    );
  }

  Widget _buildPeriodButton(String label, String value, bool isDark) {
    final isSelected = _selectedPeriod == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedPeriod = value),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? (isDark ? const Color(0xFF162E2E) : Colors.white)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 4,
                    ),
                  ]
                : null,
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              color: isSelected
                  ? (isDark ? Colors.white : const Color(0xFF0C1D1D))
                  : (isDark
                        ? const Color(0xFF6B8A8A)
                        : const Color(0xFF6B7280)),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(
    String label,
    String value,
    num change,
    IconData icon,
    Color color,
    bool isDark, {
    bool isNegative = false,
  }) {
    final changeColor = isNegative
        ? const Color(0xFFEF4444)
        : const Color(0xFF10B981);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF162E2E) : Colors.white,
        border: Border.all(
          color: isDark ? const Color(0xFF1F3B3B) : const Color(0xFFEEF2F2),
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 18, color: color),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: isDark ? const Color(0xFF6B8A8A) : const Color(0xFF6B7280),
            ),
          ),
          const Spacer(),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: isDark ? Colors.white : const Color(0xFF0C1D1D),
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(Icons.trending_up, size: 12, color: changeColor),
              const SizedBox(width: 2),
              Text(
                '+$change%',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: changeColor,
                ),
              ),
              const SizedBox(width: 4),
              Text(
                'vs last',
                style: TextStyle(
                  fontSize: 10,
                  color: isDark
                      ? const Color(0xFF6B8A8A)
                      : const Color(0xFF9CA3AF),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRevenueChart(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF162E2E) : Colors.white,
        border: Border.all(
          color: isDark ? const Color(0xFF1F3B3B) : const Color(0xFFEEF2F2),
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Revenue Trends',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : const Color(0xFF0C1D1D),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Daily performance',
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark
                          ? const Color(0xFF6B8A8A)
                          : const Color(0xFF6B7280),
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '\$12,450',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: isDark ? Colors.white : const Color(0xFF0C1D1D),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'This Month',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF00A8A8),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 120,
            child: CustomPaint(
              size: const Size(double.infinity, 120),
              painter: RevenueChartPainter(isDark),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExpenseBreakdown(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF162E2E) : Colors.white,
        border: Border.all(
          color: isDark ? const Color(0xFF1F3B3B) : const Color(0xFFEEF2F2),
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8),
        ],
      ),
      child: Row(
        children: [
          // Pie Chart
          SizedBox(
            width: 100,
            height: 100,
            child: Stack(
              children: [
                CustomPaint(
                  size: const Size(100, 100),
                  painter: PieChartPainter(),
                ),
                Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Total',
                        style: TextStyle(
                          fontSize: 9,
                          color: isDark
                              ? const Color(0xFF6B8A8A)
                              : const Color(0xFF6B7280),
                        ),
                      ),
                      Text(
                        '\$4.2k',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: isDark
                              ? Colors.white
                              : const Color(0xFF0C1D1D),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 20),
          // Legend
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Expense Breakdown',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: isDark ? Colors.white : const Color(0xFF0C1D1D),
                  ),
                ),
                const SizedBox(height: 12),
                _buildLegendItem(
                  'Restocking',
                  '70%',
                  const Color(0xFF00A8A8),
                  isDark,
                ),
                const SizedBox(height: 8),
                _buildLegendItem(
                  'Maintenance',
                  '20%',
                  const Color(0xFF10B981),
                  isDark,
                ),
                const SizedBox(height: 8),
                _buildLegendItem(
                  'Fees',
                  '10%',
                  const Color(0xFFF59E0B),
                  isDark,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(
    String label,
    String value,
    Color color,
    bool isDark,
  ) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: isDark
                    ? const Color(0xFF6B8A8A)
                    : const Color(0xFF6B7280),
              ),
            ),
          ],
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : const Color(0xFF0C1D1D),
          ),
        ),
      ],
    );
  }

  SliverToBoxAdapter _buildTransactionLog(bool isDark) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 32, 20, 0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Transaction Log',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: isDark ? Colors.white : const Color(0xFF0C1D1D),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF162E2E) : Colors.white,
                    border: Border.all(
                      color: isDark
                          ? const Color(0xFF1F3B3B)
                          : const Color(0xFFEEF2F2),
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.calendar_today,
                        size: 14,
                        color: isDark
                            ? const Color(0xFF6B8A8A)
                            : const Color(0xFF6B7280),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Oct 24',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: isDark
                              ? const Color(0xFF6B8A8A)
                              : const Color(0xFF6B7280),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Mini Stats
            Row(
              children: [
                Expanded(
                  child: _buildMiniStat(
                    'Transactions',
                    '${_stats['totalTransactions']}',
                    _stats['txChange'],
                    isDark,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMiniStat(
                    'Success Rate',
                    '${_stats['successRate']}%',
                    _stats['rateChange'],
                    isDark,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildAlertStat(
                    'Alerts',
                    '${_stats['activeAlerts']} Active',
                    isDark,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Search
            Container(
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF162E2E) : Colors.white,
                border: Border.all(
                  color: isDark
                      ? const Color(0xFF1F3B3B)
                      : const Color(0xFFEEF2F2),
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: TextField(
                controller: _searchController,
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? Colors.white : const Color(0xFF0C1D1D),
                ),
                decoration: InputDecoration(
                  hintText: 'Search ID, Item Name...',
                  hintStyle: TextStyle(
                    color: isDark
                        ? const Color(0xFF6B8A8A).withOpacity(0.7)
                        : const Color(0xFF9CA3AF),
                  ),
                  prefixIcon: Icon(
                    Icons.search,
                    color: isDark
                        ? const Color(0xFF6B8A8A)
                        : const Color(0xFF9CA3AF),
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Filters
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('All Logs', 'all', Icons.list, isDark),
                  const SizedBox(width: 8),
                  _buildFilterChip(
                    'Failed Only',
                    'failed',
                    Icons.error_outline,
                    isDark,
                  ),
                  const SizedBox(width: 8),
                  _buildFilterChip(
                    'Card Payments',
                    'card',
                    Icons.credit_card,
                    isDark,
                  ),
                  const SizedBox(width: 8),
                  _buildExportButton(isDark),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Transaction List
            ..._transactions.map((tx) => _buildTransactionCard(tx, isDark)),

            // Pagination
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Showing 1-3 of 128',
                  style: TextStyle(
                    fontSize: 11,
                    color: isDark
                        ? const Color(0xFF6B8A8A)
                        : const Color(0xFF6B7280),
                  ),
                ),
                Row(
                  children: [
                    IconButton(
                      onPressed: null,
                      icon: const Icon(Icons.chevron_left, size: 20),
                      style: IconButton.styleFrom(
                        backgroundColor: isDark
                            ? const Color(0xFF162E2E)
                            : Colors.white,
                        disabledBackgroundColor: isDark
                            ? const Color(0xFF162E2E).withOpacity(0.5)
                            : Colors.white.withOpacity(0.5),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      onPressed: () {},
                      icon: const Icon(Icons.chevron_right, size: 20),
                      style: IconButton.styleFrom(
                        backgroundColor: isDark
                            ? const Color(0xFF162E2E)
                            : Colors.white,
                        foregroundColor: isDark
                            ? Colors.white
                            : const Color(0xFF6B7280),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniStat(String label, String value, num change, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF162E2E) : Colors.white,
        border: Border.all(
          color: isDark ? const Color(0xFF1F3B3B) : const Color(0xFFEEF2F2),
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
              color: isDark ? const Color(0xFF6B8A8A) : const Color(0xFF6B7280),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                value,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: isDark ? Colors.white : const Color(0xFF0C1D1D),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  '+$change%',
                  style: const TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF10B981),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAlertStat(String label, String value, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF162E2E) : Colors.white,
        border: Border(
          left: BorderSide(color: const Color(0xFFF97316), width: 4),
          top: BorderSide(
            color: isDark ? const Color(0xFF1F3B3B) : const Color(0xFFEEF2F2),
          ),
          right: BorderSide(
            color: isDark ? const Color(0xFF1F3B3B) : const Color(0xFFEEF2F2),
          ),
          bottom: BorderSide(
            color: isDark ? const Color(0xFF1F3B3B) : const Color(0xFFEEF2F2),
          ),
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label.toUpperCase(),
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                  color: isDark
                      ? const Color(0xFF6B8A8A)
                      : const Color(0xFF6B7280),
                ),
              ),
              const Icon(Icons.warning, size: 14, color: Color(0xFFF97316)),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: isDark ? Colors.white : const Color(0xFF0C1D1D),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(
    String label,
    String value,
    IconData icon,
    bool isDark,
  ) {
    final isSelected = _selectedFilter == value;
    return GestureDetector(
      onTap: () => setState(() => _selectedFilter = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? Colors.white : const Color(0xFF0C1D1D))
              : (isDark ? const Color(0xFF162E2E) : Colors.white),
          border: Border.all(
            color: isDark ? const Color(0xFF1F3B3B) : const Color(0xFFEEF2F2),
          ),
          borderRadius: BorderRadius.circular(8),
          boxShadow: isSelected
              ? [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 8)]
              : null,
        ),
        child: Row(
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isSelected
                    ? (isDark ? const Color(0xFF0C1D1D) : Colors.white)
                    : (isDark
                          ? const Color(0xFF6B8A8A)
                          : const Color(0xFF6B7280)),
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              icon,
              size: 14,
              color: isSelected
                  ? (isDark ? const Color(0xFF0C1D1D) : Colors.white)
                  : (isDark
                        ? const Color(0xFF6B8A8A)
                        : const Color(0xFF6B7280)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExportButton(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF00A8A8).withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: const [
          Icon(Icons.download, size: 14, color: Color(0xFF00A8A8)),
          SizedBox(width: 4),
          Text(
            'Export',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Color(0xFF00A8A8),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionCard(Map<String, dynamic> tx, bool isDark) {
    Color statusColor;
    String statusLabel;
    bool isAnimated = false;

    switch (tx['status']) {
      case 'success':
        statusColor = const Color(0xFF10B981);
        statusLabel = 'Success';
        break;
      case 'failed':
        statusColor = const Color(0xFFEF4444);
        statusLabel = 'Failed';
        break;
      case 'syncing':
        statusColor = const Color(0xFFF97316);
        statusLabel = 'Syncing';
        isAnimated = true;
        break;
      default:
        statusColor = const Color(0xFF6B7280);
        statusLabel = 'Unknown';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF162E2E) : Colors.white,
        border: Border.all(
          color: isDark ? const Color(0xFF1F3B3B) : const Color(0xFFEEF2F2),
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: tx['iconBg'],
                  shape: BoxShape.circle,
                ),
                child: Icon(tx['icon'], size: 20, color: tx['iconColor']),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          tx['product'],
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: isDark
                                ? Colors.white
                                : const Color(0xFF0C1D1D),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'x${tx['quantity']} ${tx['quantity'] > 1 ? "Units" : "Unit"}',
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark
                                ? const Color(0xFF6B8A8A)
                                : const Color(0xFF6B7280),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _formatTransactionDate(tx['date']),
                      style: TextStyle(
                        fontSize: 11,
                        color: isDark
                            ? const Color(0xFF6B8A8A)
                            : const Color(0xFF6B7280),
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '\$${tx['amount'].toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : const Color(0xFF0C1D1D),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (isAnimated)
                          SizedBox(
                            width: 10,
                            height: 10,
                            child: CircularProgressIndicator(
                              strokeWidth: 1.5,
                              valueColor: AlwaysStoppedAnimation(statusColor),
                            ),
                          ),
                        if (isAnimated) const SizedBox(width: 4),
                        Text(
                          statusLabel,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: statusColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    _getPaymentIcon(tx['paymentMethod']),
                    size: 14,
                    color: isDark
                        ? const Color(0xFF6B8A8A)
                        : const Color(0xFF6B7280),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    tx['paymentMethod'],
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark
                          ? const Color(0xFF6B8A8A)
                          : const Color(0xFF6B7280),
                    ),
                  ),
                ],
              ),
              Text(
                tx['id'],
                style: TextStyle(
                  fontSize: 11,
                  fontFamily: 'monospace',
                  color: isDark
                      ? const Color(0xFF6B8A8A)
                      : const Color(0xFF9CA3AF),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  IconData _getPaymentIcon(String method) {
    if (method.contains('QRIS')) return Icons.qr_code;
    if (method.contains('Visa') || method.contains('Card'))
      return Icons.credit_card;
    if (method.contains('Apple Pay')) return Icons.nfc;
    return Icons.payment;
  }

  String _formatTransactionDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final now = DateTime.now();
      final diff = now.difference(date);

      if (diff.inDays == 0) {
        final hour = date.hour > 12
            ? date.hour - 12
            : (date.hour == 0 ? 12 : date.hour);
        final minute = date.minute.toString().padLeft(2, '0');
        final period = date.hour >= 12 ? 'PM' : 'AM';
        return 'Today, $hour:$minute $period';
      } else if (diff.inDays == 1) {
        final hour = date.hour > 12
            ? date.hour - 12
            : (date.hour == 0 ? 12 : date.hour);
        final minute = date.minute.toString().padLeft(2, '0');
        final period = date.hour >= 12 ? 'PM' : 'AM';
        return 'Yesterday, $hour:$minute $period';
      } else {
        return '${date.day}/${date.month}/${date.year}';
      }
    } catch (e) {
      return dateStr;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}

// Custom painter for revenue chart
class RevenueChartPainter extends CustomPainter {
  final bool isDark;

  RevenueChartPainter(this.isDark);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF00A8A8)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final fillPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          const Color(0xFF00A8A8).withOpacity(0.2),
          const Color(0xFF00A8A8).withOpacity(0.0),
        ],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    final path = Path();
    final fillPath = Path();

    // Sample data points
    final points = [
      Offset(0, size.height * 0.7),
      Offset(size.width * 0.2, size.height * 0.6),
      Offset(size.width * 0.4, size.height * 0.3),
      Offset(size.width * 0.6, size.height * 0.4),
      Offset(size.width * 0.8, size.height * 0.2),
      Offset(size.width, size.height * 0.15),
    ];

    path.moveTo(points[0].dx, points[0].dy);
    fillPath.moveTo(points[0].dx, size.height);
    fillPath.lineTo(points[0].dx, points[0].dy);

    for (int i = 1; i < points.length; i++) {
      final p0 = points[i - 1];
      final p1 = points[i];
      final cp1 = Offset(p0.dx + (p1.dx - p0.dx) / 2, p0.dy);
      final cp2 = Offset(p0.dx + (p1.dx - p0.dx) / 2, p1.dy);

      path.cubicTo(cp1.dx, cp1.dy, cp2.dx, cp2.dy, p1.dx, p1.dy);
      fillPath.cubicTo(cp1.dx, cp1.dy, cp2.dx, cp2.dy, p1.dx, p1.dy);
    }

    fillPath.lineTo(size.width, size.height);
    fillPath.close();

    canvas.drawPath(fillPath, fillPaint);
    canvas.drawPath(path, paint);

    // Draw dots
    final dotPaint = Paint()
      ..color = const Color(0xFF00A8A8)
      ..style = PaintingStyle.fill;

    final whiteDotPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    canvas.drawCircle(points[3], 5, whiteDotPaint);
    canvas.drawCircle(points[3], 3, dotPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// Custom painter for pie chart
class PieChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2;

    // Draw segments
    final paint1 = Paint()
      ..color = const Color(0xFF00A8A8)
      ..style = PaintingStyle.fill;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      math.pi * 2 * 0.7,
      true,
      paint1,
    );

    final paint2 = Paint()
      ..color = const Color(0xFF10B981)
      ..style = PaintingStyle.fill;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2 + math.pi * 2 * 0.7,
      math.pi * 2 * 0.2,
      true,
      paint2,
    );

    final paint3 = Paint()
      ..color = const Color(0xFFF59E0B)
      ..style = PaintingStyle.fill;
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2 + math.pi * 2 * 0.9,
      math.pi * 2 * 0.1,
      true,
      paint3,
    );

    // Draw center circle (donut hole)
    final centerPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, radius * 0.6, centerPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
