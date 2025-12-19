import 'package:flutter/material.dart';
import '../services/machine_data_service.dart';
import '../models/machine_data.dart';
import '../theme/app_theme.dart';

class MachineDetailScreen extends StatefulWidget {
  final String machineId;

  const MachineDetailScreen({super.key, required this.machineId});

  @override
  State<MachineDetailScreen> createState() => _MachineDetailScreenState();
}

class _MachineDetailScreenState extends State<MachineDetailScreen> {
  final _machineService = MachineDataService();
  List<MachineData> _history = [];
  Map<String, dynamic>? _stats;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final historyResult = await _machineService.getMachineHistory(
        machineId: widget.machineId,
        limit: 10,
      );

      final statsResult = await _machineService.getMachineStats(
        machineId: widget.machineId,
        days: 7,
      );

      if (historyResult['success'] == true) {
        final List<dynamic> data = historyResult['data'] ?? [];
        setState(() {
          _history = data.map((json) => MachineData.fromJson(json)).toList();
        });
      }

      if (statsResult['success'] == true) {
        setState(() {
          _stats = Map<String, dynamic>.from(statsResult['stats'] ?? {});
        });
      }

      setState(() => _isLoading = false);
    } catch (e) {
      setState(() {
        _errorMessage = 'Error: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Text(
          widget.machineId,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _loadData),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
                  const SizedBox(height: 16),
                  Text(
                    _errorMessage!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 16),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: _loadData,
                    icon: const Icon(Icons.refresh),
                    label: const Text('Retry'),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Stats Cards
                    if (_stats != null) ...[
                      const Text(
                        'Statistics (Last 7 Days)',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildStatsGrid(),
                      const SizedBox(height: 24),
                    ],

                    // History
                    const Text(
                      'Recent History',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),

                    if (_history.isEmpty)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32),
                          child: Text(
                            'No history data available',
                            style: TextStyle(color: Colors.grey),
                          ),
                        ),
                      )
                    else
                      ..._history
                          .map((data) => _buildHistoryCard(data))
                          .toList(),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildStatsGrid() {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard(
          icon: Icons.thermostat,
          label: 'Avg Temperature',
          value: _stats!['avg_temperature'] != null
              ? '${(_stats!['avg_temperature'] as num).toStringAsFixed(1)}°C'
              : 'N/A',
          color: Colors.orange,
        ),
        _buildStatCard(
          icon: Icons.water_drop,
          label: 'Avg Humidity',
          value: _stats!['avg_humidity'] != null
              ? '${(_stats!['avg_humidity'] as num).toStringAsFixed(0)}%'
              : 'N/A',
          color: Colors.blue,
        ),
        _buildStatCard(
          icon: Icons.shopping_cart,
          label: 'Total Sales',
          value: '${_stats!['total_sales'] ?? 0}',
          color: Colors.purple,
        ),
        _buildStatCard(
          icon: Icons.analytics,
          label: 'Data Points',
          value: '${_stats!['data_count'] ?? 0}',
          color: Colors.green,
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 32, color: color),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: Colors.grey),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryCard(MachineData data) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      _getStatusIcon(data.status),
                      size: 20,
                      color: _getStatusColor(data.status),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      data.status.toUpperCase(),
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: _getStatusColor(data.status),
                      ),
                    ),
                  ],
                ),
                Text(
                  _formatDateTime(data.recordedAt),
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildDataRow(
                    'Temp',
                    data.temperature != null
                        ? '${data.temperature!.toStringAsFixed(1)}°C'
                        : 'N/A',
                  ),
                ),
                Expanded(
                  child: _buildDataRow(
                    'Humidity',
                    data.humidity != null
                        ? '${data.humidity!.toStringAsFixed(0)}%'
                        : 'N/A',
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: _buildDataRow(
                    'Stock',
                    '${data.totalStock}/${data.totalCapacity}',
                  ),
                ),
                Expanded(child: _buildDataRow('Sales', '${data.salesCount}')),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDataRow(String label, String value) {
    return Row(
      children: [
        Text(
          '$label: ',
          style: const TextStyle(fontSize: 13, color: Colors.grey),
        ),
        Text(
          value,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'normal':
        return Colors.green;
      case 'warning':
        return Colors.orange;
      case 'error':
        return Colors.red;
      case 'offline':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status) {
      case 'normal':
        return Icons.check_circle;
      case 'warning':
        return Icons.warning;
      case 'error':
        return Icons.error;
      case 'offline':
        return Icons.cloud_off;
      default:
        return Icons.help;
    }
  }

  String _formatDateTime(DateTime time) {
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    final day = time.day.toString().padLeft(2, '0');
    final month = time.month.toString().padLeft(2, '0');
    return '$day/$month ${hour}:$minute';
  }
}
