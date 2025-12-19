class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final int stock;
  final String? imageUrl;
  final String category;
  final bool isAvailable;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int? slotId; // Added for order creation (like web)
  final int? slotNumber; // Added for display

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.stock,
    this.imageUrl,
    required this.category,
    required this.isAvailable,
    required this.createdAt,
    required this.updatedAt,
    this.slotId,
    this.slotNumber,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    // Handle stock from different sources (same as web)
    // Web uses: current_stock from slot
    int stockValue = 0;
    if (json['current_stock'] != null) {
      stockValue = json['current_stock'] is String
          ? int.tryParse(json['current_stock']) ?? 0
          : json['current_stock'] ?? 0;
    } else if (json['stock'] != null) {
      stockValue = json['stock'] is String
          ? int.tryParse(json['stock']) ?? 0
          : json['stock'] ?? 0;
    }

    // Handle slot_id (needed for order creation)
    int? slotIdValue;
    if (json['slot_id'] != null) {
      slotIdValue = json['slot_id'] is String
          ? int.tryParse(json['slot_id']) ?? null
          : json['slot_id'];
    }

    // Handle slot_number
    int? slotNumberValue;
    if (json['slot_number'] != null) {
      slotNumberValue = json['slot_number'] is String
          ? int.tryParse(json['slot_number']) ?? null
          : json['slot_number'];
    }

    // Debug logging
    print(
      'Parsing product ${json['id']}: slot_id=$slotIdValue, stock=$stockValue, current_stock=${json['current_stock']}',
    );

    return Product(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      price: (json['final_price'] ?? json['price']) is String
          ? double.tryParse(
                  (json['final_price'] ?? json['price']).toString(),
                ) ??
                0.0
          : ((json['final_price'] ?? json['price']) ?? 0).toDouble(),
      stock: stockValue,
      imageUrl: json['image_url']?.toString(),
      category: json['category']?.toString() ?? 'General',
      // Fix: Product is available if it has stock (like web)
      isAvailable: stockValue > 0,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
      slotId: slotIdValue,
      slotNumber: slotNumberValue,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'stock': stock,
      'image_url': imageUrl,
      'category': category,
      'is_available': isAvailable,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Product copyWith({
    String? id,
    String? name,
    String? description,
    double? price,
    int? stock,
    String? imageUrl,
    String? category,
    bool? isAvailable,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? slotId,
    int? slotNumber,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      price: price ?? this.price,
      stock: stock ?? this.stock,
      imageUrl: imageUrl ?? this.imageUrl,
      category: category ?? this.category,
      isAvailable: isAvailable ?? this.isAvailable,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      slotId: slotId ?? this.slotId,
      slotNumber: slotNumber ?? this.slotNumber,
    );
  }
}
