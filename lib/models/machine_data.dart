class MachineData {
  final String id;
  final String machineId;
  final double? temperature;
  final double? humidity;
  final String? doorStatus;
  final String? powerStatus;
  final Map<String, dynamic>? stockSummary;
  final int salesCount;
  final List<String> errorCodes;
  final String status;
  final DateTime recordedAt;
  final DateTime createdAt;

  MachineData({
    required this.id,
    required this.machineId,
    this.temperature,
    this.humidity,
    this.doorStatus,
    this.powerStatus,
    this.stockSummary,
    required this.salesCount,
    required this.errorCodes,
    required this.status,
    required this.recordedAt,
    required this.createdAt,
  });

  factory MachineData.fromJson(Map<String, dynamic> json) {
    return MachineData(
      id: json['id'],
      machineId: json['machine_id'],
      temperature: json['temperature']?.toDouble(),
      humidity: json['humidity']?.toDouble(),
      doorStatus: json['door_status'],
      powerStatus: json['power_status'],
      stockSummary: json['stock_summary'],
      salesCount: json['sales_count'] ?? 0,
      errorCodes: json['error_codes'] != null
          ? List<String>.from(json['error_codes'])
          : [],
      status: json['status'],
      recordedAt: DateTime.parse(json['recorded_at']),
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'machine_id': machineId,
      'temperature': temperature,
      'humidity': humidity,
      'door_status': doorStatus,
      'power_status': powerStatus,
      'stock_summary': stockSummary,
      'sales_count': salesCount,
      'error_codes': errorCodes,
      'status': status,
      'recorded_at': recordedAt.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }

  bool get isNormal => status == 'normal';
  bool get isWarning => status == 'warning';
  bool get isError => status == 'error';
  bool get isOffline => status == 'offline';

  int get totalStock {
    if (stockSummary == null) return 0;
    return stockSummary!['total_current'] ?? 0;
  }

  int get totalCapacity {
    if (stockSummary == null) return 0;
    return stockSummary!['total_capacity'] ?? 0;
  }

  double get stockPercentage {
    if (totalCapacity == 0) return 0;
    return (totalStock / totalCapacity) * 100;
  }
}
