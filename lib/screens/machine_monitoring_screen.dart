import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';

class MachineMonitoringScreen extends StatefulWidget {
  final String? machineId;

  const MachineMonitoringScreen({super.key, this.machineId});

  @override
  State<MachineMonitoringScreen> createState() =>
      _MachineMonitoringScreenState();
}

class _MachineMonitoringScreenState extends State<MachineMonitoringScreen> {
  String _selectedMachine = 'VM01';
  String _selectedTimeSlot = 'all';
  List<Map<String, dynamic>> _monitoringData = [];
  bool _isLoading = true;
  String _selectedPeriod = 'today';

  @override
  void initState() {
    super.initState();
    if (widget.machineId != null) {
      _selectedMachine = widget.machineId!;
    }
    _loadMonitoringData();
  }

  Future<void> _loadMonitoringData() async {
    setState(() => _isLoading = true);
    try {
      await Future.delayed(const Duration(milliseconds: 500));
      setState(() {
        _monitoringData = _generateMockData();
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading monitoring data: $e');
      setState(() => _isLoading = false);
    }
  }

  List<Map<String, dynamic>> _generateMockData() {
    final now = DateTime.now();
    final data = <Map<String, dynamic>>[];

    for (int day = 6; day >= 0; day--) {
      final date = now.subtract(Duration(days: day));
      for (final hour in [10, 12, 14]) {
        data.add({
          'recorded_at': DateTime(date.year, date.month, date.day, hour),
          'temperature': 22.0 + (day * 0.5) + (hour == 14 ? 2.0 : 0),
          'humidity': 60.0 + (day * 1.2) - (hour == 14 ? 5.0 : 0),
          'door_status': 'closed',
          'power_status': 'normal',
          'stock_level': 85 - (day * 2),
          'sales_count': 3 + (hour == 14 ? 2 : 0),
        });
      }
    }
    return data;
  }

  List<Map<String, dynamic>> _getFilteredData() {
    if (_selectedTimeSlot == 'all') return _monitoringData;
    final targetHour = int.parse(_selectedTimeSlot);
    return _monitoringData
        .where((data) => (data['recorded_at'] as DateTime).hour == targetHour)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark
          ? const Color(0xFF102220)
          : const Color(0xFFF6F8F8),
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
        elevation: 0,
        title: const Text(
          'Machine Monitoring',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadMonitoringData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadMonitoringData,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildMachineSelector(isDark),
                    const SizedBox(height: 16),
                    _buildPeriodSelector(isDark),
                    const SizedBox(height: 16),
                    _buildTimeSlotTabs(isDark),
                    const SizedBox(height: 24),
                    _buildChartCard(
                      'Temperature (°C)',
                      Icons.thermostat_outlined,
                      Colors.orange,
                      isDark,
                      _buildTemperatureChart(),
                    ),
                    const SizedBox(height: 16),
                    _buildChartCard(
                      'Humidity (%)',
                      Icons.water_drop_outlined,
                      Colors.blue,
                      isDark,
                      _buildHumidityChart(),
                    ),
                    const SizedBox(height: 16),
                    _buildChartCard(
                      'Stock Level (%)',
                      Icons.inventory_2_outlined,
                      Colors.green,
                      isDark,
                      _buildStockLevelChart(),
                    ),
                    const SizedBox(height: 16),
                    _buildChartCard(
                      'Sales Count',
                      Icons.shopping_cart_outlined,
                      Colors.purple,
                      isDark,
                      _buildSalesChart(),
                    ),
                    const SizedBox(height: 16),
                    _buildStatusCards(isDark),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildMachineSelector(bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
        ),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _selectedMachine,
          isExpanded: true,
          items: ['VM01', 'VM02', 'VM03'].map((machine) {
            return DropdownMenuItem(
              value: machine,
              child: Row(
                children: [
                  Icon(
                    Icons.local_convenience_store,
                    size: 20,
                    color: isDark
                        ? const Color(0xFF94A3B8)
                        : const Color(0xFF64748B),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Machine $machine',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white : const Color(0xFF0F172A),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
          onChanged: (value) {
            if (value != null) {
              setState(() {
                _selectedMachine = value;
                _loadMonitoringData();
              });
            }
          },
        ),
      ),
    );
  }

  Widget _buildPeriodSelector(bool isDark) {
    return Row(
      children: [
        Expanded(child: _buildPeriodChip('Today', 'today', isDark)),
        const SizedBox(width: 8),
        Expanded(child: _buildPeriodChip('This Week', 'week', isDark)),
        const SizedBox(width: 8),
        Expanded(child: _buildPeriodChip('This Month', 'month', isDark)),
      ],
    );
  }

  Widget _buildPeriodChip(String label, String value, bool isDark) {
    final isSelected = _selectedPeriod == value;
    return InkWell(
      onTap: () => setState(() {
        _selectedPeriod = value;
        _loadMonitoringData();
      }),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF13ECDA)
              : (isDark ? const Color(0xFF1E293B) : Colors.white),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF13ECDA)
                : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
          ),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected
                ? Colors.white
                : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
          ),
        ),
      ),
    );
  }

  Widget _buildTimeSlotTabs(bool isDark) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildTimeSlotTab('All', 'all', isDark),
          const SizedBox(width: 8),
          _buildTimeSlotTab('10:00', '10', isDark),
          const SizedBox(width: 8),
          _buildTimeSlotTab('12:00', '12', isDark),
          const SizedBox(width: 8),
          _buildTimeSlotTab('14:00', '14', isDark),
        ],
      ),
    );
  }

  Widget _buildTimeSlotTab(String label, String value, bool isDark) {
    final isSelected = _selectedTimeSlot == value;
    return InkWell(
      onTap: () => setState(() => _selectedTimeSlot = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF13ECDA)
              : (isDark ? const Color(0xFF1E293B) : Colors.white),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF13ECDA)
                : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected
                ? Colors.white
                : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
          ),
        ),
      ),
    );
  }

  Widget _buildChartCard(
    String title,
    IconData icon,
    Color color,
    bool isDark,
    Widget chart,
  ) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(width: 12),
              Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : const Color(0xFF0F172A),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(height: 200, child: chart),
        ],
      ),
    );
  }

  Widget _buildTemperatureChart() {
    final filteredData = _getFilteredData();
    if (filteredData.isEmpty) {
      return const Center(child: Text('No data available'));
    }

    final spots = filteredData.asMap().entries.map((entry) {
      return FlSpot(
        entry.key.toDouble(),
        (entry.value['temperature'] as num).toDouble(),
      );
    }).toList();

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          getDrawingHorizontalLine: (value) =>
              FlLine(color: Colors.grey.withOpacity(0.1), strokeWidth: 1),
        ),
        titlesData: FlTitlesData(
          rightTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          topTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              getTitlesWidget: (value, meta) {
                if (value.toInt() >= filteredData.length) return const Text('');
                final date =
                    filteredData[value.toInt()]['recorded_at'] as DateTime;
                return Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(
                    DateFormat('dd/MM\nHH:mm').format(date),
                    style: const TextStyle(fontSize: 9),
                    textAlign: TextAlign.center,
                  ),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) => Text(
                '${value.toInt()}°C',
                style: const TextStyle(fontSize: 10),
              ),
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        minX: 0,
        maxX: (filteredData.length - 1).toDouble(),
        minY: 18,
        maxY: 32,
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: Colors.orange,
            barWidth: 3,
            dotData: const FlDotData(show: true),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  Colors.orange.withOpacity(0.3),
                  Colors.orange.withOpacity(0.0),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHumidityChart() {
    final filteredData = _getFilteredData();
    if (filteredData.isEmpty)
      return const Center(child: Text('No data available'));

    final spots = filteredData
        .asMap()
        .entries
        .map(
          (entry) => FlSpot(
            entry.key.toDouble(),
            (entry.value['humidity'] as num).toDouble(),
          ),
        )
        .toList();

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          getDrawingHorizontalLine: (value) =>
              FlLine(color: Colors.grey.withOpacity(0.1), strokeWidth: 1),
        ),
        titlesData: FlTitlesData(
          rightTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          topTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              getTitlesWidget: (value, meta) {
                if (value.toInt() >= filteredData.length) return const Text('');
                final date =
                    filteredData[value.toInt()]['recorded_at'] as DateTime;
                return Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(
                    DateFormat('dd/MM\nHH:mm').format(date),
                    style: const TextStyle(fontSize: 9),
                    textAlign: TextAlign.center,
                  ),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) => Text(
                '${value.toInt()}%',
                style: const TextStyle(fontSize: 10),
              ),
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        minX: 0,
        maxX: (filteredData.length - 1).toDouble(),
        minY: 50,
        maxY: 80,
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: Colors.blue,
            barWidth: 3,
            dotData: const FlDotData(show: true),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  Colors.blue.withOpacity(0.3),
                  Colors.blue.withOpacity(0.0),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStockLevelChart() {
    final filteredData = _getFilteredData();
    if (filteredData.isEmpty)
      return const Center(child: Text('No data available'));

    final spots = filteredData
        .asMap()
        .entries
        .map(
          (entry) => FlSpot(
            entry.key.toDouble(),
            (entry.value['stock_level'] as num).toDouble(),
          ),
        )
        .toList();

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          getDrawingHorizontalLine: (value) =>
              FlLine(color: Colors.grey.withOpacity(0.1), strokeWidth: 1),
        ),
        titlesData: FlTitlesData(
          rightTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          topTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              getTitlesWidget: (value, meta) {
                if (value.toInt() >= filteredData.length) return const Text('');
                final date =
                    filteredData[value.toInt()]['recorded_at'] as DateTime;
                return Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(
                    DateFormat('dd/MM\nHH:mm').format(date),
                    style: const TextStyle(fontSize: 9),
                    textAlign: TextAlign.center,
                  ),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) => Text(
                '${value.toInt()}%',
                style: const TextStyle(fontSize: 10),
              ),
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        minX: 0,
        maxX: (filteredData.length - 1).toDouble(),
        minY: 60,
        maxY: 100,
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: Colors.green,
            barWidth: 3,
            dotData: const FlDotData(show: true),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  Colors.green.withOpacity(0.3),
                  Colors.green.withOpacity(0.0),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSalesChart() {
    final filteredData = _getFilteredData();
    if (filteredData.isEmpty)
      return const Center(child: Text('No data available'));

    final barGroups = filteredData.asMap().entries.map((entry) {
      return BarChartGroupData(
        x: entry.key,
        barRods: [
          BarChartRodData(
            toY: (entry.value['sales_count'] as num).toDouble(),
            color: Colors.purple,
            width: 16,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(6),
              topRight: Radius.circular(6),
            ),
          ),
        ],
      );
    }).toList();

    return BarChart(
      BarChartData(
        maxY: 10,
        titlesData: FlTitlesData(
          rightTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          topTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              getTitlesWidget: (value, meta) {
                if (value.toInt() >= filteredData.length) return const Text('');
                final date =
                    filteredData[value.toInt()]['recorded_at'] as DateTime;
                return Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(
                    DateFormat('dd/MM\nHH:mm').format(date),
                    style: const TextStyle(fontSize: 9),
                    textAlign: TextAlign.center,
                  ),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) => Text(
                value.toInt().toString(),
                style: const TextStyle(fontSize: 10),
              ),
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        gridData: FlGridData(show: true, drawVerticalLine: false),
        barGroups: barGroups,
      ),
    );
  }

  Widget _buildStatusCards(bool isDark) {
    if (_monitoringData.isEmpty) return const SizedBox.shrink();
    final latestData = _monitoringData.last;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Current Status',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: isDark ? Colors.white : const Color(0xFF0F172A),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildStatusCard(
                Icons.door_front_door_outlined,
                'Door Status',
                latestData['door_status'],
                Colors.blue,
                isDark,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatusCard(
                Icons.power_outlined,
                'Power Status',
                latestData['power_status'],
                Colors.green,
                isDark,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatusCard(
    IconData icon,
    String label,
    String value,
    Color color,
    bool isDark,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value.toUpperCase(),
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : const Color(0xFF0F172A),
            ),
          ),
        ],
      ),
    );
  }
}
