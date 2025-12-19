import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/api_config.dart';

class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  final TextEditingController _searchController = TextEditingController();
  final _authService = AuthService();
  String _selectedRole = 'all';
  bool _isLoading = true;
  List<Map<String, dynamic>> _users = [];

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() => _isLoading = true);

    try {
      // Get admin token
      final token = _authService.token;
      
      if (token == null) {
        throw Exception('Admin token not found. Please login again.');
      }

      // Make authenticated request
      final url = Uri.parse('${ApiConfig.baseUrl}/users/all');
      
      print('Fetching users from: $url');
      print('Using token: ${token.substring(0, 20)}...');
      
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      ).timeout(ApiConfig.connectionTimeout);

      print('Users API Response Status: ${response.statusCode}');
      print('Users API Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        // Handle different response formats
        List<dynamic> usersList;
        if (data['data'] != null) {
          usersList = data['data'] as List;
        } else if (data['users'] != null) {
          usersList = data['users'] as List;
        } else if (data is List) {
          usersList = data;
        } else {
          throw Exception('Unexpected response format');
        }

        print('Users count from API: ${usersList.length}');

        setState(() {
          _users = usersList.map((u) {
            return {
              'id': u['id'],
              'name': u['name'] ?? u['full_name'] ?? 'Unknown',
              'email': u['email'] ?? '',
              'role': u['role'] ?? 'buyer',
              'status': u['status'] ?? 
                        (u['is_active'] == true || u['is_active'] == 1 ? 'active' : 'inactive'),
              // Handle both camelCase and snake_case
              'lastLogin': u['lastLogin'] ?? u['last_login'],
              'createdAt': u['createdAt'] ?? u['created_at'],
            };
          }).toList();
        });

        print('✅ Successfully loaded ${_users.length} users from database');
      } else {
        throw Exception('HTTP ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      print('❌ Error loading users: $e');

      // Load mock data as fallback
      setState(() {
        _users = [
          {
            'id': 1,
            'name': 'Guest User',
            'email': 'guest@example.com',
            'role': 'buyer',
            'status': 'active',
            'lastLogin': null,
            'createdAt': DateTime.now().toIso8601String(),
          },
          {
            'id': 2,
            'name': 'Admin MediVend',
            'email': 'admin@medivend.com',
            'role': 'admin',
            'status': 'active',
            'lastLogin': DateTime.now().toIso8601String(),
            'createdAt': DateTime.now().toIso8601String(),
          },
          {
            'id': 3,
            'name': 'John Buyer Updated',
            'email': 'buyer@example.com',
            'role': 'buyer',
            'status': 'active',
            'lastLogin': DateTime.now().toIso8601String(),
            'createdAt': DateTime.now().toIso8601String(),
          },
          {
            'id': 4,
            'name': 'System Admin',
            'email': 'sysadmin@medivend.com',
            'role': 'admin',
            'status': 'active',
            'lastLogin': null,
            'createdAt': DateTime.now().toIso8601String(),
          },
        ];
      });
      
      print('⚠️  Using fallback data: ${_users.length} users');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  List<Map<String, dynamic>> get _filteredUsers {
    return _users.where((user) {
      // Search filter
      if (_searchController.text.isNotEmpty &&
          !user['name']
              .toLowerCase()
              .contains(_searchController.text.toLowerCase()) &&
          !user['email']
              .toLowerCase()
              .contains(_searchController.text.toLowerCase())) {
        return false;
      }

      // Role filter
      if (_selectedRole != 'all' && user['role'] != _selectedRole) {
        return false;
      }

      return true;
    }).toList();
  }

  String _getInitials(String name) {
    if (name.isEmpty) return 'NA';
    
    final parts = name.trim().split(' ');
    if (parts.length >= 2 && parts[0].isNotEmpty && parts[1].isNotEmpty) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    
    if (name.length >= 2) {
      return name.substring(0, 2).toUpperCase();
    }
    
    return name[0].toUpperCase() + 'A';
  }

  Map<String, dynamic> _getRoleDisplay(String role) {
    switch (role.toLowerCase()) {
      case 'admin':
      case 'super_admin':
        return {
          'label': 'Super Admin',
          'icon': Icons.security,
          'bgColor': const Color(0xFFDEEBFF),
          'darkBgColor': const Color(0xFF1E3A8A).withOpacity(0.2),
          'textColor': const Color(0xFF0C4A6E),
          'darkTextColor': const Color(0xFF93C5FD),
          'borderColor': const Color(0xFFBFDBFE),
          'darkBorderColor': const Color(0xFF1E40AF),
        };
      case 'buyer':
      case 'customer':
        return {
          'label': 'Customer',
          'icon': Icons.shopping_bag,
          'bgColor': const Color(0xFFE0E7FF),
          'darkBgColor': const Color(0xFF312E81).withOpacity(0.2),
          'textColor': const Color(0xFF4338CA),
          'darkTextColor': const Color(0xFFA5B4FC),
          'borderColor': const Color(0xFFC7D2FE),
          'darkBorderColor': const Color(0xFF4338CA),
        };
      default:
        return {
          'label': 'Guest',
          'icon': Icons.person_outline,
          'bgColor': const Color(0xFFF3F4F6),
          'darkBgColor': const Color(0xFF374151),
          'textColor': const Color(0xFF4B5563),
          'darkTextColor': const Color(0xFF9CA3AF),
          'borderColor': const Color(0xFFE5E7EB),
          'darkBorderColor': const Color(0xFF4B5563),
        };
    }
  }

  String _formatLastLogin(String? lastLogin) {
    if (lastLogin == null || lastLogin.isEmpty) return 'Never';

    try {
      // Parse and convert to local time
      DateTime loginDate = DateTime.parse(lastLogin);
      
      // If it's UTC, convert to local
      if (loginDate.isUtc) {
        loginDate = loginDate.toLocal();
      }
      
      final now = DateTime.now();
      final diff = now.difference(loginDate);

      // Handle future dates (timezone issues)
      if (diff.isNegative) {
        print('Warning: Last login is in the future: $lastLogin');
        return 'Just now';
      }

      // Same day (within last 24 hours)
      if (diff.inHours < 24 && loginDate.day == now.day) {
        return 'Today';
      } else if (diff.inDays == 1 || 
                 (diff.inHours < 48 && loginDate.day == now.day - 1)) {
        return 'Yesterday';
      } else if (diff.inDays < 7) {
        return '${diff.inDays} days ago';
      } else if (diff.inDays < 30) {
        final weeks = (diff.inDays / 7).floor();
        return weeks == 1 ? '1 week ago' : '$weeks weeks ago';
      } else {
        // Format: DD/MM/YYYY
        return '${loginDate.day.toString().padLeft(2, '0')}/${loginDate.month.toString().padLeft(2, '0')}/${loginDate.year}';
      }
    } catch (e) {
      print('Error formatting date "$lastLogin": $e');
      return 'Never';
    }
  }

  String _formatLastLoginTime(String? lastLogin) {
    if (lastLogin == null || lastLogin.isEmpty) return '';

    try {
      // Parse and convert to local time
      DateTime loginDate = DateTime.parse(lastLogin);
      
      // If it's UTC, convert to local
      if (loginDate.isUtc) {
        loginDate = loginDate.toLocal();
      }
      
      int hour = loginDate.hour;
      final period = hour >= 12 ? 'PM' : 'AM';
      
      // Convert to 12-hour format
      if (hour == 0) {
        hour = 12; // Midnight
      } else if (hour > 12) {
        hour = hour - 12;
      }
      
      final minute = loginDate.minute.toString().padLeft(2, '0');

      return '$hour:$minute $period';
    } catch (e) {
      print('Error formatting time "$lastLogin": $e');
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor:
          isDark ? const Color(0xFF0F2323) : const Color(0xFFFAFAFA),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadUsers,
          child: CustomScrollView(
            slivers: [
              // Header
              _buildHeader(isDark),

              // Description & Actions
              _buildActionsSection(isDark),

              // Search and Filter
              _buildSearchAndFilter(isDark),

              // Users List
              _buildUsersList(isDark),

              // Spacing for bottom nav
              SliverToBoxAdapter(child: const SizedBox(height: 100)),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Add user functionality
        },
        backgroundColor: const Color(0xFF00A8A8),
        child: const Icon(Icons.add, color: Colors.white),
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
                  'User Management',
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
              'User Management',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: isDark ? Colors.white : const Color(0xFF0C1D1D),
                letterSpacing: -0.5,
                height: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  SliverToBoxAdapter _buildActionsSection(bool isDark) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Manage access permissions, roles, and security settings for MediVend personnel.',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: isDark
                    ? const Color(0xFF6B8A8A)
                    : const Color(0xFF6B8A8A),
                height: 1.5,
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _loadUsers,
                    icon: const Icon(Icons.refresh, size: 20),
                    label: const Text('Refresh'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: BorderSide(
                        color: isDark
                            ? const Color(0xFF1F3B3B)
                            : const Color(0xFFEEF2F2),
                      ),
                      foregroundColor:
                          isDark ? Colors.white : const Color(0xFF0C1D1D),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      // TODO: Add admin
                    },
                    icon: const Icon(Icons.add, size: 20),
                    label: const Text('Add Admin'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00A8A8),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      elevation: 4,
                      shadowColor: const Color(0xFF00A8A8).withOpacity(0.3),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  SliverToBoxAdapter _buildSearchAndFilter(bool isDark) {
    return SliverToBoxAdapter(
      child: Padding(
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
                  hintText: 'Search users by name, email...',
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

            // Role Filter Dropdown
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
              child: DropdownButtonFormField<String>(
                value: _selectedRole,
                onChanged: (value) => setState(() => _selectedRole = value!),
                decoration: InputDecoration(
                  prefixIcon: Icon(
                    Icons.filter_list,
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
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: isDark ? Colors.white : const Color(0xFF0C1D1D),
                ),
                dropdownColor:
                    isDark ? const Color(0xFF162E2E) : Colors.white,
                items: const [
                  DropdownMenuItem(value: 'all', child: Text('All Roles')),
                  DropdownMenuItem(
                      value: 'admin', child: Text('Super Admin')),
                  DropdownMenuItem(value: 'buyer', child: Text('Customer')),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  SliverPadding _buildUsersList(bool isDark) {
    if (_isLoading) {
      return SliverPadding(
        padding: const EdgeInsets.all(20),
        sliver: SliverToBoxAdapter(
          child: Center(
            child: CircularProgressIndicator(
              color: const Color(0xFF00A8A8),
            ),
          ),
        ),
      );
    }

    final users = _filteredUsers;

    if (users.isEmpty) {
      return SliverPadding(
        padding: const EdgeInsets.all(20),
        sliver: SliverToBoxAdapter(
          child: Center(
            child: Column(
              children: [
                Icon(
                  Icons.people_outline,
                  size: 48,
                  color: isDark
                      ? const Color(0xFF6B8A8A)
                      : const Color(0xFF6B8A8A),
                ),
                const SizedBox(height: 12),
                Text(
                  'No users found',
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
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final user = users[index];
            return _buildUserCard(user, isDark);
          },
          childCount: users.length,
        ),
      ),
    );
  }

  Widget _buildUserCard(Map<String, dynamic> user, bool isDark) {
    final roleDisplay = _getRoleDisplay(user['role']);
    final initials = _getInitials(user['name']);
    final lastLoginDate = _formatLastLogin(user['lastLogin']);
    final lastLoginTime = _formatLastLoginTime(user['lastLogin']);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF162E2E) : Colors.white,
        border: Border.all(
          color: isDark
              ? const Color(0xFF1F3B3B).withOpacity(0.5)
              : const Color(0xFFEEF2F2),
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
          // User Header
          Row(
            children: [
              // Avatar
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: const Color(0xFF00A8A8).withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    initials,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF00A8A8),
                    ),
                  ),
                ),
              ),

              const SizedBox(width: 12),

              // Name & Email
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user['name'],
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: isDark ? Colors.white : const Color(0xFF0C1D1D),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      user['email'],
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark
                            ? const Color(0xFF6B8A8A)
                            : const Color(0xFF6B8A8A),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 8),

              // Actions
              Row(
                children: [
                  IconButton(
                    onPressed: () {
                      // TODO: Edit user
                    },
                    icon: Icon(
                      Icons.edit_outlined,
                      size: 20,
                      color: isDark
                          ? const Color(0xFF6B8A8A)
                          : const Color(0xFF6B8A8A),
                    ),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: () {
                      // TODO: Delete user
                    },
                    icon: const Icon(
                      Icons.delete_outline,
                      size: 20,
                      color: Color(0xFFEF4444),
                    ),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            ],
          ),

          // Divider
          const SizedBox(height: 12),
          Divider(
            color: isDark
                ? const Color(0xFF1F3B3B)
                : const Color(0xFFEEF2F2),
            height: 1,
          ),
          const SizedBox(height: 12),

          // User Details
          Row(
            children: [
              // Role
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'ROLE',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: isDark
                            ? const Color(0xFF6B8A8A)
                            : const Color(0xFF6B8A8A),
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: isDark
                            ? roleDisplay['darkBgColor']
                            : roleDisplay['bgColor'],
                        border: Border.all(
                          color: isDark
                              ? roleDisplay['darkBorderColor']
                              : roleDisplay['borderColor'],
                        ),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            roleDisplay['icon'],
                            size: 14,
                            color: isDark
                                ? roleDisplay['darkTextColor']
                                : roleDisplay['textColor'],
                          ),
                          const SizedBox(width: 4),
                          Text(
                            roleDisplay['label'],
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: isDark
                                  ? roleDisplay['darkTextColor']
                                  : roleDisplay['textColor'],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 12),

              // Status
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'STATUS',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: isDark
                            ? const Color(0xFF6B8A8A)
                            : const Color(0xFF6B8A8A),
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Container(
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            color: user['status'] == 'active'
                                ? const Color(0xFF10B981)
                                : const Color(0xFFEF4444),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: (user['status'] == 'active'
                                        ? const Color(0xFF10B981)
                                        : const Color(0xFFEF4444))
                                    .withOpacity(0.6),
                                blurRadius: 8,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          user['status'] == 'active' ? 'Active' : 'Inactive',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color:
                                isDark ? Colors.white : const Color(0xFF0C1D1D),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Last Login
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'LAST LOGIN',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: isDark
                      ? const Color(0xFF6B8A8A)
                      : const Color(0xFF6B8A8A),
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 6),
              if (lastLoginDate == 'Never')
                Text(
                  'Never',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark ? Colors.white : const Color(0xFF0C1D1D),
                  ),
                )
              else
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lastLoginDate,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: isDark ? Colors.white : const Color(0xFF0C1D1D),
                      ),
                    ),
                    if (lastLoginTime.isNotEmpty)
                      Text(
                        lastLoginTime,
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark
                              ? const Color(0xFF6B8A8A)
                              : const Color(0xFF6B8A8A),
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
