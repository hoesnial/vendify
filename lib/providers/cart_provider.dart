import 'package:flutter/foundation.dart';
import '../models/cart_item.dart';
import '../models/product.dart';

class CartProvider with ChangeNotifier {
  final List<CartItem> _items = [];

  List<CartItem> get items => _items;

  int get itemCount => _items.length;

  int get totalItems => _items.fold(0, (sum, item) => sum + item.quantity);

  int get totalQuantity => _items.fold(0, (sum, item) => sum + item.quantity);

  double get totalAmount =>
      _items.fold(0.0, (sum, item) => sum + item.totalPrice);

  double get totalPrice =>
      _items.fold(0.0, (sum, item) => sum + item.totalPrice);

  bool get isEmpty => _items.isEmpty;

  // Add product to cart (alias for addProduct)
  void addItem(Product product, int quantity) {
    addProduct(product, quantity: quantity);
  }

  // Add product to cart
  void addProduct(Product product, {int quantity = 1}) {
    final existingIndex = _items.indexWhere(
      (item) => item.product.id == product.id,
    );

    if (existingIndex >= 0) {
      // Product already in cart, update quantity
      _items[existingIndex].quantity += quantity;
    } else {
      // Add new product to cart
      _items.add(CartItem(product: product, quantity: quantity));
    }

    notifyListeners();
  }

  // Remove product from cart (alias for removeProduct)
  void removeItem(String productId) {
    removeProduct(productId);
  }

  // Remove product from cart
  void removeProduct(String productId) {
    _items.removeWhere((item) => item.product.id == productId);
    notifyListeners();
  }

  // Update product quantity
  void updateQuantity(String productId, int quantity) {
    final index = _items.indexWhere((item) => item.product.id == productId);

    if (index >= 0) {
      if (quantity <= 0) {
        _items.removeAt(index);
      } else {
        _items[index].quantity = quantity;
      }
      notifyListeners();
    }
  }

  // Increase quantity
  void increaseQuantity(String productId) {
    final index = _items.indexWhere((item) => item.product.id == productId);

    if (index >= 0) {
      final maxStock = _items[index].product.stock;
      if (_items[index].quantity < maxStock) {
        _items[index].quantity++;
        notifyListeners();
      }
    }
  }

  // Decrease quantity
  void decreaseQuantity(String productId) {
    final index = _items.indexWhere((item) => item.product.id == productId);

    if (index >= 0) {
      if (_items[index].quantity > 1) {
        _items[index].quantity--;
        notifyListeners();
      } else {
        _items.removeAt(index);
      }
      notifyListeners();
    }
  }

  // Clear cart (alias for clearCart)
  void clear() {
    clearCart();
  }

  // Clear cart
  void clearCart() {
    _items.clear();
    notifyListeners();
  }

  // Check if product is in cart
  bool isInCart(String productId) {
    return _items.any((item) => item.product.id == productId);
  }

  // Get quantity of product in cart
  int getQuantity(String productId) {
    final index = _items.indexWhere((item) => item.product.id == productId);
    return index >= 0 ? _items[index].quantity : 0;
  }

  // Convert cart to order items
  List<Map<String, dynamic>> toOrderItems() {
    return _items.map((item) => item.toJson()).toList();
  }
}
