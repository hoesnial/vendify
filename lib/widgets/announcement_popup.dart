import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/announcement_service.dart';

class AnnouncementPopup extends StatefulWidget {
  final List<Announcement> announcements;
  final VoidCallback? onClose;

  const AnnouncementPopup({
    Key? key,
    required this.announcements,
    this.onClose,
  }) : super(key: key);

  @override
  State<AnnouncementPopup> createState() => _AnnouncementPopupState();
}

class _AnnouncementPopupState extends State<AnnouncementPopup> with SingleTickerProviderStateMixin {
  int _currentIndex = 0;
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    
    // Setup animations
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );

    _scaleAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutBack,
    );

    _fadeAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeIn,
    );

    _animationController.forward();

    // Track view for first announcement
    if (widget.announcements.isNotEmpty) {
      _trackView(widget.announcements[0]);
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _trackView(Announcement announcement) async {
    await AnnouncementService.trackInteraction(
      announcementId: announcement.id,
      action: 'VIEWED',
    );
  }

  Future<void> _handleDismiss() async {
    final announcement = widget.announcements[_currentIndex];
    await AnnouncementService.dismissAnnouncement(announcement.id);
    
    if (_currentIndex < widget.announcements.length - 1) {
      // Show next announcement
      setState(() {
        _currentIndex++;
      });
      _trackView(widget.announcements[_currentIndex]);
    } else {
      // Close popup
      _close();
    }
  }

  Future<void> _handleActionButton(Announcement announcement) async {
    if (announcement.actionButtonUrl != null) {
      await AnnouncementService.trackInteraction(
        announcementId: announcement.id,
        action: 'CLICKED',
      );

      final url = Uri.parse(announcement.actionButtonUrl!);
      if (await canLaunchUrl(url)) {
        await launchUrl(url, mode: LaunchMode.externalApplication);
      }
    }
  }

  void _close() {
    _animationController.reverse().then((_) {
      if (widget.onClose != null) {
        widget.onClose!();
      } else {
        Navigator.of(context).pop();
      }
    });
  }

  Color _parseColor(String? hexColor, Color fallback) {
    if (hexColor == null || hexColor.isEmpty) return fallback;
    try {
      final hex = hexColor.replaceAll('#', '');
      return Color(int.parse('FF$hex', radix: 16));
    } catch (e) {
      return fallback;
    }
  }

  // Get Material Icon from icon name
  IconData? _getIconData(String iconName) {
    // Map common Material Symbol names to Flutter Icons
    switch (iconName.toLowerCase()) {
      case 'error':
        return Icons.error;
      case 'warning':
        return Icons.warning;
      case 'info':
        return Icons.info;
      case 'build':
      case 'construction':
        return Icons.build;
      case 'celebration':
      case 'party':
        return Icons.celebration;
      case 'check_circle':
      case 'check':
        return Icons.check_circle;
      case 'cancel':
      case 'close':
        return Icons.cancel;
      case 'notifications':
      case 'notification':
        return Icons.notifications;
      case 'campaign':
        return Icons.campaign;
      case 'announcement':
        return Icons.announcement;
      default:
        return null; // Return null if not a known icon name
    }
  }

  // Check if string is emoji (contains emoji characters)
  bool _isEmoji(String text) {
    if (text.isEmpty) return false;
    
    // Check if contains emoji unicode ranges
    final runes = text.runes.toList();
    return runes.any((rune) =>
        (rune >= 0x1F600 && rune <= 0x1F64F) || // Emoticons
        (rune >= 0x1F300 && rune <= 0x1F5FF) || // Misc Symbols and Pictographs
        (rune >= 0x1F680 && rune <= 0x1F6FF) || // Transport and Map
        (rune >= 0x1F1E0 && rune <= 0x1F1FF) || // Flags
        (rune >= 0x2600 && rune <= 0x26FF) ||   // Misc symbols
        (rune >= 0x2700 && rune <= 0x27BF) ||   // Dingbats
        (rune >= 0xFE00 && rune <= 0xFE0F) ||   // Variation Selectors
        (rune >= 0x1F900 && rune <= 0x1F9FF) || // Supplemental Symbols and Pictographs
        (rune >= 0x1FA70 && rune <= 0x1FAFF));  // Symbols and Pictographs Extended-A
  }

  // Get background color based on announcement type
  Color _getBackgroundColor(String type) {
    // Always return white for consistency
    return Colors.white;
  }

  // Get accent color based on announcement type
  Color _getAccentColor(String type) {
    switch (type) {
      case 'ERROR':
        return const Color(0xFFEF4444); // red-500
      case 'WARNING':
        return const Color(0xFFF59E0B); // amber-500
      case 'MAINTENANCE':
        return const Color(0xFFF59E0B); // amber-500
      case 'PROMOTION':
        return const Color(0xFFA855F7); // purple-500
      case 'INFO':
      default:
        return const Color(0xFF13DAEC); // cyan (app primary)
    }
  }

  // Get light background for icon circle based on type
  Color _getIconBackgroundColor(String type) {
    switch (type) {
      case 'ERROR':
        return const Color(0xFFFEE2E2); // red-100
      case 'WARNING':
        return const Color(0xFFFEF3C7); // amber-100
      case 'MAINTENANCE':
        return const Color(0xFFFEF3C7); // amber-100
      case 'PROMOTION':
        return const Color(0xFFF3E8FF); // purple-100
      case 'INFO':
      default:
        return const Color(0xFFCFF9FE); // cyan-100
    }
  }

  // Get text color - always dark for readability on white
  Color _getTextColor(String type) {
    return const Color(0xFF0D1C1C); // Always dark text on white background
  }

  @override
  Widget build(BuildContext context) {
    if (widget.announcements.isEmpty) {
      return const SizedBox.shrink();
    }

    final announcement = widget.announcements[_currentIndex];
    
    // Background is always white
    final bgColor = Colors.white;
    
    // Accent color from type (for icon & buttons)
    final accentColor = _getAccentColor(announcement.type);
    
    // Icon circle background (light version of accent)
    final iconBgColor = _getIconBackgroundColor(announcement.type);
    
    // Text is always dark on white background
    final textColor = const Color(0xFF0D1C1C);
    
    // Use custom icon if provided, otherwise use default by type
    final iconText = announcement.icon ?? 
        AnnouncementService.getDefaultIcon(announcement.type);
    
    return Material(
      color: const Color(0x66000000), // Semi-transparent black
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 2, sigmaY: 2),
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: Center(
            child: ScaleTransition(
              scale: _scaleAnimation,
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                constraints: const BoxConstraints(maxWidth: 380),
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.3),
                      blurRadius: 40,
                      offset: const Offset(0, 20),
                    ),
                  ],
                ),
                child: Stack(
                  children: [
                    // Decorative gradient top
                    Positioned(
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 128,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              accentColor.withOpacity(0.1),
                              Colors.transparent,
                            ],
                          ),
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(24),
                          ),
                        ),
                      ),
                    ),
                    
                    // Main content
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Icon
                        Padding(
                          padding: const EdgeInsets.only(top: 32, bottom: 20),
                          child: Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              color: iconBgColor,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: accentColor.withOpacity(0.2),
                                  blurRadius: 16,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                              border: Border.all(
                                color: bgColor,
                                width: 4,
                              ),
                            ),
                            child: Center(
                              child: () {
                                // Try to get Material Icon first
                                final iconData = _getIconData(iconText);
                                
                                if (iconData != null) {
                                  // Render as Material Icon
                                  return Icon(
                                    iconData,
                                    size: 48,
                                    color: accentColor,
                                  );
                                } else if (_isEmoji(iconText)) {
                                  // Render as Emoji (Text)
                                  return Text(
                                    iconText,
                                    style: TextStyle(
                                      fontSize: 40,
                                      color: accentColor,
                                    ),
                                  );
                                } else {
                                  // Fallback: try to render as text
                                  return Text(
                                    iconText,
                                    style: TextStyle(
                                      fontSize: 32,
                                      fontWeight: FontWeight.bold,
                                      color: accentColor,
                                    ),
                                  );
                                }
                              }(),
                            ),
                          ),
                        ),

                        // Title
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          child: Text(
                            announcement.title,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: textColor,
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              height: 1.2,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ),
                        
                        const SizedBox(height: 8),

                        // Message
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          child: Text(
                            announcement.message,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Color(0xFF64748B), // slate-600
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                              height: 1.5,
                            ),
                          ),
                        ),

                        const SizedBox(height: 32),

                        // Action Button (if has action)
                        if (announcement.hasActionButton && 
                            announcement.actionButtonText != null)
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 24),
                            child: SizedBox(
                              width: double.infinity,
                              height: 56,
                              child: ElevatedButton(
                                onPressed: () => _handleActionButton(announcement),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: accentColor,
                                  foregroundColor: Colors.white,
                                  elevation: 8,
                                  shadowColor: accentColor.withOpacity(0.3),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                child: Text(
                                  announcement.actionButtonText!,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.3,
                                  ),
                                ),
                              ),
                            ),
                          ),

                        if (announcement.hasActionButton && 
                            announcement.actionButtonText != null)
                          const SizedBox(height: 8),

                        // Primary Dismiss/Next Button
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 24),
                          child: SizedBox(
                            width: double.infinity,
                            height: 56,
                            child: ElevatedButton(
                              onPressed: _handleDismiss,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: accentColor,
                                foregroundColor: Colors.white,
                                elevation: 8,
                                shadowColor: accentColor.withOpacity(0.3),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: Text(
                                _currentIndex < widget.announcements.length - 1
                                    ? 'Next'
                                    : 'Got It',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 0.3,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ),

                        // Secondary "Remind me later" text button (if needed)
                        if (announcement.hasActionButton)
                          Padding(
                            padding: const EdgeInsets.only(top: 12),
                            child: TextButton(
                              onPressed: _close,
                              style: TextButton.styleFrom(
                                foregroundColor: const Color(0xFF94A3B8), // slate-400
                                padding: const EdgeInsets.symmetric(vertical: 8),
                              ),
                              child: Text(
                                _currentIndex < widget.announcements.length - 1
                                    ? 'Skip for now'
                                    : 'Remind me later',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: const Color(0xFF64748B), // slate-500
                                ),
                              ),
                            ),
                          ),

                        const SizedBox(height: 24),

                        // Pagination dots (if multiple announcements)
                        if (widget.announcements.length > 1)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(
                                widget.announcements.length,
                                (index) => Container(
                                  width: 8,
                                  height: 8,
                                  margin: const EdgeInsets.only(right: 6),
                                  decoration: BoxDecoration(
                                    color: index == _currentIndex
                                        ? accentColor
                                        : const Color(0xFFCBD5E1), // slate-300
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Helper function to show announcement popup
Future<void> showAnnouncementPopup(
  BuildContext context,
  List<Announcement> announcements,
) async {
  if (announcements.isEmpty) return;

  await showDialog(
    context: context,
    barrierDismissible: false,
    barrierColor: Colors.black54,
    builder: (context) => AnnouncementPopup(
      announcements: announcements,
    ),
  );
}
