import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';
  static const String _roleKey = 'user_role';

  String? _token;
  Map<String, dynamic>? _userData;
  String? _role;

  // Getters
  String? get token => _token;
  Map<String, dynamic>? get userData => _userData;
  String? get role => _role;
  bool get isLoggedIn => _token != null;
  bool get isAdmin => _role == 'admin';
  bool get isBuyer => _role == 'buyer';
  bool get isGuest => _role == 'guest';

  /// Initialize auth state from storage
  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString(_tokenKey);
    _role = prefs.getString(_roleKey);

    final userJson = prefs.getString(_userKey);
    if (userJson != null) {
      _userData = jsonDecode(userJson);
    }

    print('Auth initialized - Token: ${_token != null}, Role: $_role');
  }

  /// Register new buyer account
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    required String fullName,
    String? phone,
  }) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/users/register');
      final response = await http
          .post(
            url,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'email': email,
              'password': password,
              'full_name': fullName,
              'phone': phone,
            }),
          )
          .timeout(ApiConfig.connectionTimeout);

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        if (data['success'] == true) {
          // Save token and user data
          await _saveAuthData(
            token: data['token'],
            userData: data['user'],
            role: data['user']['role'],
          );

          return {
            'success': true,
            'message': 'Registration successful',
            'user': data['user'],
          };
        }
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Registration failed',
      };
    } catch (e) {
      print('Register error: $e');
      return {'success': false, 'message': 'Network error: ${e.toString()}'};
    }
  }

  /// Login with email and password
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
    String? fcmToken,
  }) async {
    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/users/login');
      print('Login URL: $url');

      final response = await http
          .post(
            url,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({
              'email': email,
              'password': password,
              if (fcmToken != null) 'fcm_token': fcmToken,
            }),
          )
          .timeout(ApiConfig.connectionTimeout);

      print('Login response: ${response.statusCode}');
      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        if (data['success'] == true) {
          // Save token and user data
          await _saveAuthData(
            token: data['token'],
            userData: data['user'],
            role: data['user']['role'],
          );

          return {
            'success': true,
            'message': 'Login successful',
            'user': data['user'],
            'role': data['user']['role'],
          };
        }
      }

      return {'success': false, 'message': data['message'] ?? 'Login failed'};
    } catch (e) {
      print('Login error: $e');
      return {'success': false, 'message': 'Network error: ${e.toString()}'};
    }
  }

  /// Get user profile
  Future<Map<String, dynamic>> getProfile() async {
    if (_token == null) {
      return {'success': false, 'message': 'Not authenticated'};
    }

    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/users/profile');
      final response = await http
          .get(
            url,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $_token',
            },
          )
          .timeout(ApiConfig.connectionTimeout);

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        _userData = data['user'];
        await _saveUserData(data['user']);

        return {'success': true, 'user': data['user']};
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Failed to get profile',
      };
    } catch (e) {
      print('Get profile error: $e');
      return {'success': false, 'message': 'Network error: ${e.toString()}'};
    }
  }

  /// Update user profile
  Future<Map<String, dynamic>> updateProfile({
    String? fullName,
    String? phone,
    String? fcmToken,
  }) async {
    if (_token == null) {
      return {'success': false, 'message': 'Not authenticated'};
    }

    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/users/profile');
      final body = <String, dynamic>{};

      if (fullName != null) body['full_name'] = fullName;
      if (phone != null) body['phone'] = phone;
      if (fcmToken != null) body['fcm_token'] = fcmToken;

      final response = await http
          .put(
            url,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $_token',
            },
            body: jsonEncode(body),
          )
          .timeout(ApiConfig.connectionTimeout);

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        _userData = data['user'];
        await _saveUserData(data['user']);

        return {
          'success': true,
          'message': 'Profile updated successfully',
          'user': data['user'],
        };
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Failed to update profile',
      };
    } catch (e) {
      print('Update profile error: $e');
      return {'success': false, 'message': 'Network error: ${e.toString()}'};
    }
  }

  /// Change password
  Future<Map<String, dynamic>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    if (_token == null) {
      return {'success': false, 'message': 'Not authenticated'};
    }

    try {
      final url = Uri.parse('${ApiConfig.baseUrl}/users/password');
      final response = await http
          .put(
            url,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $_token',
            },
            body: jsonEncode({
              'current_password': currentPassword,
              'new_password': newPassword,
            }),
          )
          .timeout(ApiConfig.connectionTimeout);

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'message': 'Password changed successfully'};
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Failed to change password',
      };
    } catch (e) {
      print('Change password error: $e');
      return {'success': false, 'message': 'Network error: ${e.toString()}'};
    }
  }

  /// Logout
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
    await prefs.remove(_roleKey);

    _token = null;
    _userData = null;
    _role = null;

    print('User logged out');
  }

  /// Save authentication data
  Future<void> _saveAuthData({
    required String token,
    required Map<String, dynamic> userData,
    required String role,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(userData));
    await prefs.setString(_roleKey, role);

    _token = token;
    _userData = userData;
    _role = role;

    print('Auth data saved - Role: $role');
  }

  /// Save user data only
  Future<void> _saveUserData(Map<String, dynamic> userData) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userKey, jsonEncode(userData));
    _userData = userData;
  }
}
