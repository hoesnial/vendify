"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Plus, Package, Box } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import ProductList from "@/components/admin/ProductList";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_active: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle mock data fallback
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // Use /all endpoint for admin - returns simple array
      const response = await fetch("http://localhost:3001/api/products/all");
      const data = await response.json();

      // Should be array directly
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn("Error fetching products, using mock data:", error);
       // Mock Data Fallback
        const mockProducts: Product[] = [
          {
            id: 1,
            name: "Keripik Singkong Balado",
            description: "Keripik singkong renyah dengan bumbu balado pedas manis.",
            price: 15000,
            image_url: "https://images.unsplash.com/photo-1566478996085-3947b22d6448?q=80&w=300&auto=format&fit=crop",
            category: "Snack",
            is_active: true,
          },
          {
            id: 2,
            name: "Teh Botol Sosro",
            description: "Minuman teh melati dalam kemasan botol yang menyegarkan.",
            price: 5000,
            image_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=300&auto=format&fit=crop",
            category: "Minuman",
            is_active: true,
          },
          {
            id: 3,
            name: "Choco Bar Dairy Milk",
            description: "Cokelat susu lembut dan creamy yang meleleh di mulut.",
            price: 12000,
            image_url: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=300&auto=format&fit=crop",
            category: "Cokelat",
            is_active: true,
          },
        ];
        setProducts(mockProducts);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Product deleted successfully");
        fetchProducts();
      } else {
         // Mock delete for now if backend unavailable
         setProducts(products.filter(p => p.id !== id));
         alert("Product deleted (Mock)");
        // throw new Error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      // Fallback for demo
      setProducts(products.filter(p => p.id !== id));
      alert("Product deleted (Mock)");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="flex h-screen bg-amber-50/20 font-['Inter']">
      <AdminSidebar />
      
      <main className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="flex flex-col gap-8 max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-end gap-6">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Link href="/admin" className="hover:text-amber-600 transition-colors">Admin</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-900">Produk</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-amber-900">
                Manajemen Produk
              </h1>
              <p className="text-gray-500 font-medium">
                Kelola katalog produk vending machine, harga, dan stok barang.
              </p>
            </div>
            
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 h-12 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-200 transition-all hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                <span>Tambah Produk</span>
              </button>
            )}
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-[32px] shadow-lg shadow-amber-100/50 border border-amber-100 overflow-hidden p-6 md:p-8">
            {showForm ? (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4 pb-6 border-b border-amber-100">
                  <button 
                    onClick={handleCancelForm}
                    className="p-2 -ml-2 rounded-lg hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
                  </h2>
                </div>
                <ProductForm
                  product={editingProduct}
                  onSuccess={handleFormSuccess}
                  onCancel={handleCancelForm}
                />
              </div>
            ) : (
                <>
                {products.length === 0 && !isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                            <Package className="w-12 h-12 text-amber-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Produk</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            Katalog produk Anda masih kosong. Mulai tambahkan produk snack dan minuman untuk dijual.
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 h-12 px-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-all shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            Buat Produk Pertama
                        </button>
                    </div>
                ) : (
                  <ProductList
                    products={products}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )}
                </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
