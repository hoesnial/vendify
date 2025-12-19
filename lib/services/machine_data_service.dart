import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class MachineDataService {
  static final MachineDataService _instance = MachineDataService._internal();
  factory MachineDataService() => _instance;
  MachineDataService._internal();

  /// Get latest data for all machines
  Future<Map<String, dynamic>> getLatestData() async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/machine-data/latest');
      final response = await http.get(url).timeout(ApiConfig.connectionTimeout);

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data['data'] ?? []};
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Failed to get latest data',
      };
    } catch (e) {
      print('Get latest data error: $e');
      return {'success': false, 'message': 'Network error: ${e.toString()}'};
    }
  }

  /// Get history for specific machine
  Future<Map<String, dynamic>> getMachineHistory({
    required String machineId,
    String? from,
    String? to,
    int limit = 50,
  }) async {
    try {
      final queryParams = {
        'limit': limit.toString(),
        if (from != null) 'from': from,
        if (to != null) 'to': to,
      };

      final uri = Uri.parse(
        '${ApiConfig.baseUrl}/machine-data/machine/$machineId',
      ).replace(queryParameters: queryParams);

      final response = await http.get(uri).timeout(ApiConfig.connectionTimeout);

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data['data'] ?? []};
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Failed to get machine history',
      };
    } catch (e) {
      print('Get machine history error: $e');
      return {'success': false, 'message': 'Network error: ${e.toString()}'};
    }
  }

  /// Get today's scheduled data (10:00, 12:00, 14:00)
  Future<Map<String, dynamic>> getTodayData() async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/machine-data/today');
      final response = await http.get(url).timeout(ApiConfig.connectionTimeout);

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data['data'] ?? []};
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Failed to get today data',
      };
    } catch (e) {
      print('Get today data error: $e');
      return {'success': false, 'message': 'Network error: ${e.toString()}'};
    }
  }

  /// Get statistics for a machine
  Future<Map<String, dynamic>> getMachineStats({
    required String machineId,
    int days = 7,
  }) async {
    try {
      final uri = Uri.parse(
        '${ApiConfig.baseUrl}/machine-data/stats/$machineId',
      ).replace(queryParameters: {'days': days.toString()});

      final response = await http.get(uri).timeout(ApiConfig.connectionTimeout);

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'stats': data['stats'] ?? {}};
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Failed to get machine stats',
      };
    } catch (e) {
      print('Get machine stats error: $e');
      return {'success': false, 'message': 'Network error: ${e.toString()}'};
    }
  }

  /// Post machine data (from IoT device)
  Future<Map<String, dynamic>> postMachineData({
    required String machineId,
    required double temperature,
    required double humidity,
    required String doorStatus,
    required String powerStatus,
    required Map<String, dynamic> stockSummary,
    required int salesCount,
    List<String> errorCodes = const [],
    required String status,
    DateTime? recordedAt,
  }) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/machine-data');
      final response = await http
          .post(
            url,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'machine_id': machineId,
              'temperature': temperature,
              'humidity': humidity,
              'door_status': doorStatus,
              'power_status': powerStatus,
              'stock_summary': stockSummary,
              'sales_count': salesCount,
              'error_codes': errorCodes,
              'status': status,
              'recorded_at': (recordedAt ?? DateTime.now()).toIso8601String(),
            }),
          )
          .timeout(ApiConfig.connectionTimeout);

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {'success': true, 'data': data['data']};
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Failed to post machine data',
      };
    } catch (e) {
      print('Post machine data error: $e');
      return {'success': false, 'message': 'Network error: ${e.toString()}'};
    }
  }
}
