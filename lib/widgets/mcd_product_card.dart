import 'package:flutter/material.dart';
import '../models/product.dart';
import '../theme/app_theme.dart';
import '../utils/helpers.dart';

class McdProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback onTap;
  final VoidCallback? onBuy;

  const McdProductCard({
    super.key,
    required this.product,
    required this.onTap,
    this.onBuy,
  });

  @override
  Widget build(BuildContext context) {
    final bool isAvailable = product.stock > 0;

    return GestureDetector(
      onTap: isAvailable ? onTap : null,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image with Badge
            Stack(
              children: [
                // Image Container
                Container(
                  height: 140,
                  decoration: const BoxDecoration(
                    color: AppTheme.softBlue,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(16),
                      topRight: Radius.circular(16),
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(16),
                      topRight: Radius.circular(16),
                    ),
                    child:
                        product.imageUrl != null && product.imageUrl!.isNotEmpty
                        ? Image.network(
                            Helpers.getImageUrl(product.imageUrl),
                            width: double.infinity,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return _buildSkeleton();
                            },
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return _buildSkeleton();
                            },
                          )
                        : _buildSkeleton(),
                  ),
                ),

                // Stock Badge (or Best Seller/Promo visual)
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: isAvailable ? AppTheme.primary : AppTheme.errorRed,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      isAvailable ? 'Ready' : 'Habis',
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            // Product Info
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Product Name
                    Text(
                      product.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                        height: 1.2,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),

                    const SizedBox(height: 4),

                    // Category
                    Text(
                      product.category,
                      style: const TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 12,
                      ),
                    ),

                    const Spacer(),

                    // Price and Add Button
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        // Price
                        Expanded(
                          child: Text(
                            Helpers.formatCurrency(product.price),
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.accentBlue,
                            ),
                          ),
                        ),

                        // Add Button (Small)
                        if (isAvailable)
                          Material(
                            color: Colors.transparent,
                            child: InkWell(
                              onTap: onBuy,
                              borderRadius: BorderRadius.circular(20),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: AppTheme.accentBlue,
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: const Text(
                                  'Beli',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
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
          ],
        ),
      ),
    );
  }

  Widget _buildSkeleton() {
    return Container(
      color: Colors.grey[200],
      child: Center(
        child: SizedBox(
          width: 24,
          height: 24,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(Colors.grey[400]!),
          ),
        ),
      ),
    );
  }
}
