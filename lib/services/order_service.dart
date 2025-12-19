import '../models/order.dart';
import '../config/api_config.dart';
import 'api_service.dart';

class OrderService {
  final ApiService _apiService = ApiService();

  // Create new order
  Future<Order> createOrder(Map<String, dynamic> orderData) async {
    try {
      final response = await _apiService.post(
        ApiEndpoints.orders,
        body: orderData,
      );

      final orderJson = response['order'] ?? response;
      return Order.fromJson(orderJson);
    } catch (e) {
      print('Error creating order: $e');
      rethrow;
    }
  }

  // Get all orders (alias for getAllOrders)
  Future<List<Order>> getOrders() async {
    return getAllOrders();
  }

  // Get all orders (order history)
  // Note: Mobile app doesn't have order history endpoint
  // This returns empty list for now
  Future<List<Order>> getAllOrders() async {
    try {
      // Mobile app doesn't need full order history
      // Return empty list
      print('getAllOrders: Not implemented for mobile app');
      return [];
    } catch (e) {
      print('Error getting orders: $e');
      return [];
    }
  }

  // Get order by ID
  Future<Order> getOrderById(String id) async {
    try {
      final response = await _apiService.get(ApiEndpoints.orderById(id));

      final orderJson = response['order'] ?? response;
      return Order.fromJson(orderJson);
    } catch (e) {
      print('Error getting order by ID: $e');
      rethrow;
    }
  }

  // Get order by order_id (not _id)
  Future<Order?> getOrderByOrderId(String orderId) async {
    try {
      final orders = await getAllOrders();
      return orders.firstWhere(
        (order) => order.orderId == orderId,
        orElse: () => throw Exception('Order not found'),
      );
    } catch (e) {
      print('Error getting order by order_id: $e');
      return null;
    }
  }

  // Update order status
  Future<Order> updateOrderStatus(String id, String status) async {
    try {
      final response = await _apiService.put(
        ApiEndpoints.updateOrderStatus(id),
        body: {'status': status},
      );

      final orderJson = response['order'] ?? response;
      return Order.fromJson(orderJson);
    } catch (e) {
      print('Error updating order status: $e');
      rethrow;
    }
  }

  // Get pending orders
  Future<List<Order>> getPendingOrders() async {
    try {
      final orders = await getAllOrders();
      return orders.where((order) => order.isPending).toList();
    } catch (e) {
      print('Error getting pending orders: $e');
      rethrow;
    }
  }

  // Get completed orders
  Future<List<Order>> getCompletedOrders() async {
    try {
      final orders = await getAllOrders();
      return orders.where((order) => order.isPaid).toList();
    } catch (e) {
      print('Error getting completed orders: $e');
      rethrow;
    }
  }

  // Cancel order
  Future<Order> cancelOrder(String id) async {
    try {
      return await updateOrderStatus(id, 'cancelled');
    } catch (e) {
      print('Error cancelling order: $e');
      rethrow;
    }
  }
}
