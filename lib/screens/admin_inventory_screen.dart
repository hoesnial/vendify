import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AdminInventoryScreen extends StatefulWidget {
  const AdminInventoryScreen({super.key});

  @override
  State<AdminInventoryScreen> createState() => _AdminInventoryScreenState();
}

class _AdminInventoryScreenState extends State<AdminInventoryScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedFilter = 'all';
  bool _isLoading = true;
  List<Map<String, dynamic>> _products = [];
  Map<String, dynamic> _stats = {
    'totalSKUs': 0,
    'lowStockAlerts': 0,
    'critical': 0,
    'temperature': '4.2',
  };

  @override
  void initState() {
    super.initState();
    _loadInventory();
  }

  Future<void> _loadInventory() async {
    setState(() => _isLoading = true);

    try {
      final apiService = ApiService();
      final data = await apiService.get('/products/available');

      final products = data['data'] as List;

      setState(() {
        _products = products.map((p) {
          final stock = p['current_stock'] ?? 0;
          final capacity = p['capacity'] ?? 50;
          final percentage = (stock / capacity * 100).round();

          String status = 'In Stock';
          Color statusColor = const Color(0xFF10B981);
          Color? borderColor;

          if (stock == 0) {
            status = 'Out of Stock';
            statusColor = const Color(0xFFEF4444);
            borderColor = const Color(0xFFEF4444).withOpacity(0.4);
          } else if (stock <= 5) {
            status = 'Low Stock';
            statusColor = const Color(0xFFF59E0B);
            borderColor = const Color(0xFFF59E0B).withOpacity(0.4);
          }

          return {
            'id': p['id'],
            'name': p['name'],
            'sku': 'SKU-${p['id'].toString().padLeft(5, '0')}',
            'slot': p['slot_number'] ?? 'N/A',
            'currentStock': stock,
            'capacity': capacity,
            'percentage': percentage,
            'status': status,
            'statusColor': statusColor,
            'borderColor': borderColor,
            'imageUrl': p['image_url'],
          };
        }).toList();

        // Calculate stats
        _stats = {
          'totalSKUs': _products.length,
          'lowStockAlerts': _products
              .where((p) => p['currentStock'] > 0 && p['currentStock'] <= 5)
              .length,
          'critical': _products.where((p) => p['currentStock'] == 0).length,
          'temperature': '4.2',
        };
      });
    } catch (e) {
      print('Error loading inventory: $e');

      // Load mock data as fallback
      setState(() {
        _products = [
          {
            'id': 1,
            'name': 'Promag',
            'sku': 'SKU-00001',
            'slot': 'A1',
            'currentStock': 45,
            'capacity': 50,
            'percentage': 90,
            'status': 'In Stock',
            'statusColor': const Color(0xFF10B981),
            'borderColor': null,
            'imageUrl': null,
          },
          {
            'id': 2,
            'name': 'Domperidone',
            'sku': 'SKU-00002',
            'slot': 'A2',
            'currentStock': 45,
            'capacity': 50,
            'percentage': 90,
            'status': 'In Stock',
            'statusColor': const Color(0xFF10B981),
            'borderColor': null,
            'imageUrl': null,
          },
          {
            'id': 3,
            'name': 'Ibuprofen 400mg',
            'sku': 'SKU-00003',
            'slot': 'B1',
            'currentStock': 5,
            'capacity': 50,
            'percentage': 10,
            'status': 'Low Stock',
            'statusColor': const Color(0xFFF59E0B),
            'borderColor': const Color(0xFFF59E0B).withOpacity(0.4),
            'imageUrl': null,
          },
          {
            'id': 4,
            'name': 'Antibiotic Ointment',
            'sku': 'SKU-00004',
            'slot': 'C4',
            'currentStock': 3,
            'capacity': 20,
            'percentage': 15,
            'status': 'Low Stock',
            'statusColor': const Color(0xFFF59E0B),
            'borderColor': const Color(0xFFF59E0B).withOpacity(0.4),
            'imageUrl': null,
          },
        ];

        // Calculate stats from mock data
        _stats = {
          'totalSKUs': _products.length,
          'lowStockAlerts': _products
              .where((p) => p['currentStock'] > 0 && p['currentStock'] <= 5)
              .length,
          'critical': _products.where((p) => p['currentStock'] == 0).length,
          'temperature': '4.2',
        };
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  List<Map<String, dynamic>> get _filteredProducts {
    var filtered = _products.where((product) {
      // Search filter
      if (_searchController.text.isNotEmpty &&
          !product['name'].toLowerCase().contains(
            _searchController.text.toLowerCase(),
          )) {
        return false;
      }

      // Category filter
      if (_selectedFilter == 'low' && product['currentStock'] > 5) {
        return false;
      }
      if (_selectedFilter == 'out' && product['currentStock'] > 0) {
        return false;
      }

      return true;
    }).toList();

    return filtered;
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
          onRefresh: _loadInventory,
          child: CustomScrollView(
            slivers: [
              // Header
              _buildHeader(isDark),

              // Stats Cards
              _buildStatsCards(isDark),

              // Search and Filters
              _buildSearchAndFilters(isDark),

              // Products List
              _buildProductsList(isDark),

              // Spacing for bottom nav
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
                  'Stock Management',
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
              'Inventory Overview',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white : const Color(0xFF0C1D1D),
                letterSpacing: -0.5,
                height: 1.2,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Monitor product levels and manage reorders for ',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: isDark
                    ? const Color(0xFF6B8A8A)
                    : const Color(0xFF6B8A8A),
              ),
            ),
            Row(
              children: [
                Text(
                  'Machine VM01',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: isDark
                        ? const Color(0xFF00A8A8)
                        : const Color(0xFF00A8A8),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Add Product Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  // TODO: Add product functionality
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: isDark
                      ? Colors.white
                      : const Color(0xFF0C1D1D),
                  foregroundColor: isDark
                      ? const Color(0xFF0C1D1D)
                      : Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  elevation: 4,
                  shadowColor: isDark
                      ? Colors.transparent
                      : Colors.black.withOpacity(0.1),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.add, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Add Product',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  SliverToBoxAdapter _buildStatsCards(bool isDark) {
    final stats = [
      {
        'label': 'Total SKUs',
        'value': '${_stats['totalSKUs']}',
        'icon': Icons.inventory_2_outlined,
        'iconColor': const Color(0xFFD1D5DB),
        'change': '+2 items added',
        'changeIcon': Icons.trending_up,
        'changeColor': const Color(0xFF10B981),
      },
      {
        'label': 'Low Stock Alerts',
        'value': '${_stats['lowStockAlerts']}',
        'icon': Icons.warning_amber_outlined,
        'iconColor': const Color(0xFFF59E0B).withOpacity(0.5),
        'change': 'Requires refill soon',
        'valueColor': const Color(0xFFF59E0B),
      },
      {
        'label': 'Critical (Empty)',
        'value': '${_stats['critical']}',
        'icon': Icons.cancel_outlined,
        'iconColor': const Color(0xFFEF4444).withOpacity(0.5),
        'change': 'Action needed',
        'valueColor': const Color(0xFFEF4444),
      },
      {
        'label': 'Storage Temp',
        'value': '${_stats['temperature']}°F',
        'icon': Icons.thermostat_outlined,
        'iconColor': const Color(0xFF00A8A8).withOpacity(0.5),
        'change': 'Optimal Range',
        'changeIcon': Icons.check_circle_outline,
        'changeColor': const Color(0xFF10B981),
      },
    ];

    return SliverToBoxAdapter(
      child: Container(
        padding: const EdgeInsets.only(left: 20, top: 8),
        height: 160,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          itemCount: stats.length,
          itemBuilder: (context, index) {
            final stat = stats[index];
            return Container(
              width: 150,
              margin: EdgeInsets.only(
                right: index == stats.length - 1 ? 20 : 12,
                bottom: 16,
              ),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF162E2E) : Colors.white,
                border: Border.all(
                  color: isDark
                      ? const Color(0xFF1F3B3B)
                      : const Color(0xFFEEF2F2),
                ),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 2,
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          stat['label'] as String,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: isDark
                                ? const Color(0xFF6B8A8A)
                                : const Color(0xFF6B8A8A),
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Icon(
                        stat['icon'] as IconData,
                        size: 20,
                        color: stat['iconColor'] as Color,
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        stat['value'] as String,
                        style: TextStyle(
                          fontSize: 30,
                          fontWeight: FontWeight.w800,
                          color:
                              stat['valueColor'] as Color? ??
                              (isDark ? Colors.white : const Color(0xFF0C1D1D)),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          if (stat['changeIcon'] != null)
                            Icon(
                              stat['changeIcon'] as IconData,
                              size: 14,
                              color: stat['changeColor'] as Color?,
                            ),
                          if (stat['changeIcon'] != null)
                            const SizedBox(width: 4),
                          Flexible(
                            child: Text(
                              stat['change'] as String,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color:
                                    stat['changeColor'] as Color? ??
                                    (isDark
                                        ? const Color(0xFF6B8A8A)
                                        : const Color(0xFF6B8A8A)),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  SliverToBoxAdapter _buildSearchAndFilters(bool isDark) {
    return SliverToBoxAdapter(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        child: Column(
          children: [
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
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 2,
                  ),
                ],
              ),
              child: TextField(
                controller: _searchController,
                onChanged: (_) => setState(() {}),
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: isDark ? Colors.white : const Color(0xFF0C1D1D),
                ),
                decoration: InputDecoration(
                  hintText: 'Search by product name...',
                  hintStyle: TextStyle(
                    color: isDark
                        ? const Color(0xFF6B8A8A).withOpacity(0.7)
                        : const Color(0xFF6B8A8A).withOpacity(0.7),
                  ),
                  prefixIcon: Icon(
                    Icons.search,
                    color: isDark
                        ? const Color(0xFF6B8A8A)
                        : const Color(0xFF6B8A8A),
                  ),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Filter Chips
            SizedBox(
              height: 40,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  _buildFilterChip('All Items', 'all', Icons.list, isDark),
                  const SizedBox(width: 10),
                  _buildFilterChip(
                    'Low Stock (${_stats['lowStockAlerts']})',
                    'low',
                    Icons.warning_amber,
                    isDark,
                    badgeColor: const Color(0xFFF59E0B),
                  ),
                  const SizedBox(width: 10),
                  _buildFilterChip(
                    'Out of Stock (${_stats['critical']})',
                    'out',
                    Icons.block,
                    isDark,
                    badgeColor: const Color(0xFFEF4444),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(
    String label,
    String value,
    IconData icon,
    bool isDark, {
    Color? badgeColor,
  }) {
    final isSelected = _selectedFilter == value;

    return GestureDetector(
      onTap: () => setState(() => _selectedFilter = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? (isDark ? const Color(0xFFFFFFFF) : const Color(0xFF0C1D1D))
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
            Icon(
              icon,
              size: 16,
              color: isSelected
                  ? (isDark ? const Color(0xFF0C1D1D) : Colors.white)
                  : (badgeColor ??
                        (isDark ? Colors.white : const Color(0xFF0C1D1D))),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: isSelected
                    ? (isDark ? const Color(0xFF0C1D1D) : Colors.white)
                    : (isDark ? Colors.white : const Color(0xFF0C1D1D)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  SliverPadding _buildProductsList(bool isDark) {
    if (_isLoading) {
      return SliverPadding(
        padding: const EdgeInsets.all(20),
        sliver: SliverToBoxAdapter(
          child: Center(
            child: CircularProgressIndicator(
              color: isDark ? const Color(0xFF00A8A8) : const Color(0xFF00A8A8),
            ),
          ),
        ),
      );
    }

    final products = _filteredProducts;

    if (products.isEmpty) {
      return SliverPadding(
        padding: const EdgeInsets.all(20),
        sliver: SliverToBoxAdapter(
          child: Center(
            child: Column(
              children: [
                Icon(
                  Icons.inventory_2_outlined,
                  size: 48,
                  color: isDark
                      ? const Color(0xFF6B8A8A)
                      : const Color(0xFF6B8A8A),
                ),
                const SizedBox(height: 12),
                Text(
                  'No products found',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: isDark
                        ? const Color(0xFF6B8A8A)
                        : const Color(0xFF6B8A8A),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate((context, index) {
          final product = products[index];
          return _buildProductCard(product, isDark);
        }, childCount: products.length),
      ),
    );
  }

  Widget _buildProductCard(Map<String, dynamic> product, bool isDark) {
    final statusColor = product['statusColor'] as Color;
    final borderColor = product['borderColor'] as Color?;
    final percentage = product['percentage'] as int;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF162E2E) : Colors.white,
        border: Border.all(
          color:
              borderColor ??
              (isDark ? const Color(0xFF1F3B3B) : const Color(0xFFEEF2F2)),
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 2),
        ],
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product Image
              Container(
                width: 56,
                height: 56,
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0xFF1F2937)
                      : const Color(0xFFF9FAFB),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: product['imageUrl'] != null
                    ? Image.network(
                        product['imageUrl'],
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) => Icon(
                          Icons.medication,
                          color: isDark
                              ? const Color(0xFF6B8A8A)
                              : const Color(0xFF6B8A8A),
                        ),
                      )
                    : Icon(
                        Icons.medication,
                        color: isDark
                            ? const Color(0xFF6B8A8A)
                            : const Color(0xFF6B8A8A),
                      ),
              ),

              const SizedBox(width: 16),

              // Product Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            product['name'],
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: isDark
                                  ? Colors.white
                                  : const Color(0xFF0C1D1D),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Row(
                          children: [
                            Icon(
                              product['status'] == 'Low Stock'
                                  ? Icons.warning_amber
                                  : Icons.check_circle,
                              size: 16,
                              color: statusColor,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              product['status'],
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: statusColor,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),

                    const SizedBox(height: 12),

                    // SKU and Slot
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0xFF1F2937)
                                : const Color(0xFFF3F4F6),
                            border: Border.all(
                              color: isDark
                                  ? const Color(0xFF374151)
                                  : const Color(0xFFE5E7EB),
                            ),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            product['sku'],
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: isDark
                                  ? const Color(0xFF6B8A8A)
                                  : const Color(0xFF6B8A8A),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: isDark
                                ? const Color(0xFF1F2937)
                                : const Color(0xFFF3F4F6),
                            border: Border.all(
                              color: isDark
                                  ? const Color(0xFF374151)
                                  : const Color(0xFFE5E7EB),
                            ),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'Slot: ${product['slot']}',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: isDark
                                  ? const Color(0xFF6B8A8A)
                                  : const Color(0xFF6B8A8A),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Stock Progress
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${product['currentStock']} / ${product['capacity']}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: isDark
                                ? Colors.white
                                : const Color(0xFF0C1D1D),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: LinearProgressIndicator(
                        value: percentage / 100,
                        minHeight: 10,
                        backgroundColor: isDark
                            ? const Color(0xFF374151)
                            : const Color(0xFFF3F4F6),
                        valueColor: AlwaysStoppedAnimation<Color>(statusColor),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),

              // Actions
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: isDark
                            ? const Color(0xFF1F3B3B)
                            : const Color(0xFFEEF2F2),
                      ),
                      color: isDark ? const Color(0xFF162E2E) : Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: IconButton(
                      padding: EdgeInsets.zero,
                      icon: Icon(
                        Icons.edit_outlined,
                        size: 18,
                        color: isDark
                            ? const Color(0xFF6B8A8A)
                            : const Color(0xFF6B8A8A),
                      ),
                      onPressed: () {
                        // TODO: Edit product
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    height: 36,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: isDark
                            ? const Color(0xFF1F3B3B)
                            : const Color(0xFFEEF2F2),
                      ),
                      color: isDark ? const Color(0xFF162E2E) : Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: TextButton(
                      onPressed: () {
                        // TODO: Adjust stock
                      },
                      style: TextButton.styleFrom(
                        padding: EdgeInsets.zero,
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: Text(
                        'Adjust',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: isDark
                              ? Colors.white
                              : const Color(0xFF0C1D1D),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
