import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class Announcement {
  final int id;
  final String title;
  final String message;
  final String type;
  final int priority;
  final String? icon;
  final String? bgColor;
  final String? textColor;
  final bool hasActionButton;
  final String? actionButtonText;
  final String? actionButtonUrl;

  Announcement({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.priority,
    this.icon,
    this.bgColor,
    this.textColor,
    this.hasActionButton = false,
    this.actionButtonText,
    this.actionButtonUrl,
  });

  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      type: json['type'] ?? 'INFO',
      priority: json['priority'] ?? 0,
      icon: json['icon'],
      bgColor: json['bg_color'],
      textColor: json['text_color'],
      hasActionButton: json['has_action_button'] ?? false,
      actionButtonText: json['action_button_text'],
      actionButtonUrl: json['action_button_url'],
    );
  }
}

class AnnouncementService {
  static const String _dismissedKey = 'dismissed_announcements';

  /// Fetch active announcements for mobile platform
  static Future<List<Announcement>> getActiveAnnouncements({
    String? machineId,
  }) async {
    try {
      final uri = Uri.parse(
        '${ApiConfig.baseUrl}/announcements/active?platform=mobile${machineId != null ? '&machine_id=$machineId' : ''}',
      );

      print('Fetching announcements from: $uri');

      final response = await http.get(uri).timeout(
            const Duration(seconds: 10),
            onTimeout: () {
              throw Exception('Connection timeout');
            },
          );

      print('Announcements response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> announcementsJson = data['data'];
          final announcements = announcementsJson
              .map((json) => Announcement.fromJson(json))
              .toList();

          // Filter out dismissed announcements
          final filtered = await _filterDismissed(announcements);
          
          print('Loaded ${filtered.length} active announcements');
          return filtered;
        }
      }

      return [];
    } catch (e) {
      print('Error fetching announcements: $e');
      return [];
    }
  }

  /// Filter out dismissed announcements
  static Future<List<Announcement>> _filterDismissed(
      List<Announcement> announcements) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final dismissedIds = prefs.getStringList(_dismissedKey) ?? [];
      
      return announcements
          .where((a) => !dismissedIds.contains(a.id.toString()))
          .toList();
    } catch (e) {
      print('Error filtering dismissed announcements: $e');
      return announcements;
    }
  }

  /// Track announcement interaction (view, click, dismiss)
  static Future<void> trackInteraction({
    required int announcementId,
    required String action, // 'VIEWED', 'CLICKED', 'DISMISSED'
    String? userId,
    String? machineId,
  }) async {
    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/announcements/track');

      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'announcement_id': announcementId,
          'action': action,
          'user_id': userId ?? 'anonymous',
          'machine_id': machineId ?? 'VM01',
        }),
      ).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        print('Tracked $action for announcement $announcementId');
      } else {
        print('Failed to track $action: ${response.statusCode}');
      }
    } catch (e) {
      print('Error tracking interaction: $e');
    }
  }

  /// Mark announcement as dismissed
  static Future<void> dismissAnnouncement(int announcementId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final dismissedIds = prefs.getStringList(_dismissedKey) ?? [];
      
      if (!dismissedIds.contains(announcementId.toString())) {
        dismissedIds.add(announcementId.toString());
        await prefs.setStringList(_dismissedKey, dismissedIds);
      }

      // Track dismiss action
      await trackInteraction(
        announcementId: announcementId,
        action: 'DISMISSED',
      );

      print('Dismissed announcement $announcementId');
    } catch (e) {
      print('Error dismissing announcement: $e');
    }
  }

  /// Clear all dismissed announcements (for testing)
  static Future<void> clearDismissed() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_dismissedKey);
      print('Cleared all dismissed announcements');
    } catch (e) {
      print('Error clearing dismissed: $e');
    }
  }

  /// Get icon data based on type
  static String getDefaultIcon(String type) {
    switch (type) {
      case 'ERROR':
        return '❌';
      case 'WARNING':
        return '⚠️';
      case 'MAINTENANCE':
        return '🔧';
      case 'PROMOTION':
        return '🎉';
      case 'INFO':
      default:
        return 'ℹ️';
    }
  }

  /// Get background color based on type
  static String getDefaultBgColor(String type) {
    switch (type) {
      case 'ERROR':
        return '#FFEBEE';
      case 'WARNING':
        return '#FFF3CD';
      case 'MAINTENANCE':
        return '#FFF3CD';
      case 'PROMOTION':
        return '#F3E5F5';
      case 'INFO':
      default:
        return '#E3F2FD';
    }
  }

  /// Get text color based on type
  static String getDefaultTextColor(String type) {
    switch (type) {
      case 'ERROR':
        return '#C62828';
      case 'WARNING':
        return '#856404';
      case 'MAINTENANCE':
        return '#856404';
      case 'PROMOTION':
        return '#7B1FA2';
      case 'INFO':
      default:
        return '#1565C0';
    }
  }
}
