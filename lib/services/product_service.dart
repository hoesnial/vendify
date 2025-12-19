import '../models/product.dart';
import '../config/api_config.dart';
import 'api_service.dart';

class ProductService {
  final ApiService _apiService = ApiService();

  // Get all products (alias for getAllProducts)
  Future<List<Product>> getProducts() async {
    return getAllProducts();
  }

  // Get all products (using /available endpoint like web)
  Future<List<Product>> getAllProducts() async {
    // try {
    //   // Use the same endpoint as web: /products/available
    //   final response = await _apiService.get(
    //     '${ApiEndpoints.products}/available',
    //   );

    //   // Handle new Supabase response format: { success: true, data: [...] }
    //   // Or legacy format: { machine_id: "VM01", products: [...] }
    //   List<dynamic> productsJson;

    //   if (response is Map<String, dynamic>) {
    //     // New format with "data" key
    //     if (response.containsKey('data')) {
    //       productsJson = response['data'] as List<dynamic>;
    //     }
    //     // Legacy format with "products" key
    //     else if (response.containsKey('products')) {
    //       productsJson = response['products'] as List<dynamic>;
    //     }
    //     // Direct array response
    //     else {
    //       throw Exception('Unexpected response format: $response');
    //     }
    //   }
    //   // Direct array response
    //   else if (response is List) {
    //     productsJson = response;
    //   } else {
    //     throw Exception('Unexpected response type: ${response.runtimeType}');
    //   }

    //   // Debug: Print first product to see structure
    //   if (productsJson.isNotEmpty) {
    //     print('First product from API: ${productsJson[0]}');
    //   }

    //   return productsJson.map((json) => Product.fromJson(json)).toList();
    // } catch (e) {
    //   print('Error getting products: $e');
    //   rethrow;
    // }

    // DUMMY DATA (API OFF)
    await Future.delayed(const Duration(seconds: 1)); // Simulate network delay
    return [
      Product(
        id: '1',
        name: 'Keripik Kentang',
        description: 'Keripik kentang renyah rasa original 50gr',
        price: 15000,
        stock: 5,
        imageUrl: '', // Kosong agar pakai Skeleton
        category: 'Snack',
        isAvailable: true,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Product(
        id: '2',
        name: 'Coklat Batang',
        description: 'Coklat susu manis lezat 30gr',
        price: 12000,
        stock: 0, // Habis
        imageUrl: '',
        category: 'Coklat',
        isAvailable: false,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
      Product(
        id: '3',
        name: 'Air Mineral',
        description: 'Air mineral pegunungan 600ml',
        price: 5000,
        stock: 10,
        imageUrl: '',
        category: 'Minuman',
        isAvailable: true,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      ),
    ];
  }

  // Get product by ID
  Future<Product> getProductById(String id) async {
    try {
      final response = await _apiService.get(ApiEndpoints.productById(id));

      final productJson = response['product'] ?? response;
      return Product.fromJson(productJson);
    } catch (e) {
      print('Error getting product by ID: $e');
      rethrow;
    }
  }

  // Search products
  Future<List<Product>> searchProducts(String query) async {
    try {
      final products = await getAllProducts();

      if (query.isEmpty) {
        return products;
      }

      return products.where((product) {
        return product.name.toLowerCase().contains(query.toLowerCase()) ||
            product.description.toLowerCase().contains(query.toLowerCase()) ||
            product.category.toLowerCase().contains(query.toLowerCase());
      }).toList();
    } catch (e) {
      print('Error searching products: $e');
      rethrow;
    }
  }

  // Filter products by category
  Future<List<Product>> getProductsByCategory(String category) async {
    try {
      final products = await getAllProducts();

      if (category.isEmpty || category.toLowerCase() == 'all') {
        return products;
      }

      return products.where((product) {
        return product.category.toLowerCase() == category.toLowerCase();
      }).toList();
    } catch (e) {
      print('Error filtering products by category: $e');
      rethrow;
    }
  }

  // Get available products only
  Future<List<Product>> getAvailableProducts() async {
    try {
      final products = await getAllProducts();

      return products.where((product) {
        return product.isAvailable && product.stock > 0;
      }).toList();
    } catch (e) {
      print('Error getting available products: $e');
      rethrow;
    }
  }

  // Get all categories
  Future<List<String>> getCategories() async {
    try {
      final products = await getAllProducts();

      final categories = products
          .map((product) => product.category)
          .toSet()
          .toList();

      categories.sort();
      return categories;
    } catch (e) {
      print('Error getting categories: $e');
      rethrow;
    }
  }

  // Admin: Create product
  Future<Product> createProduct(Map<String, dynamic> productData) async {
    try {
      final response = await _apiService.post(
        ApiEndpoints.products,
        body: productData,
      );

      final productJson = response['product'] ?? response;
      return Product.fromJson(productJson);
    } catch (e) {
      print('Error creating product: $e');
      rethrow;
    }
  }

  // Admin: Update product
  Future<Product> updateProduct(
    String id,
    Map<String, dynamic> productData,
  ) async {
    try {
      final response = await _apiService.put(
        ApiEndpoints.productById(id),
        body: productData,
      );

      final productJson = response['product'] ?? response;
      return Product.fromJson(productJson);
    } catch (e) {
      print('Error updating product: $e');
      rethrow;
    }
  }

  // Admin: Delete product
  Future<void> deleteProduct(String id) async {
    try {
      await _apiService.delete(ApiEndpoints.productById(id));
    } catch (e) {
      print('Error deleting product: $e');
      rethrow;
    }
  }

  // Update product stock
  Future<Product> updateStock(String id, int newStock) async {
    try {
      final response = await _apiService.put(
        ApiEndpoints.productById(id),
        body: {'stock': newStock},
      );

      final productJson = response['product'] ?? response;
      return Product.fromJson(productJson);
    } catch (e) {
      print('Error updating stock: $e');
      rethrow;
    }
  }
}
