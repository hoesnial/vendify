"use client";

import { useState, useRef, useEffect } from "react";
import { vendingAPI, Product } from "@/lib/api";
import { useVendingStore } from "@/lib/store";
import {
  Send,
  Bot,
  User,
  Loader2,
  AlertCircle,
  Sparkles,
  X,
  // MessageCircle,
  Minimize2,
  ShoppingCart,
} from "lucide-react";
import OnScreenKeyboard from "./OnScreenKeyboard";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isHealthRelated?: boolean;
  recommendedProducts?: Product[];
}

export default function FloatingHealthAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Halo! 👋 Saya adalah asisten kesehatan virtual. Saya dapat membantu Anda dengan pertanyaan seputar kesehatan, obat-obatan, penyakit, dan rekomendasi perawatan kesehatan. Ada yang bisa saya bantu?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setSelectedProduct, setCurrentScreen } = useVendingStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);
    setShowKeyboard(false);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await vendingAPI.chatWithAssistant(
        userMessage.content,
        conversationHistory
      );

      console.log("🔍 API Response:", response);
      console.log("📦 Recommended Products:", response.recommendedProducts);

      if (response.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: response.message,
          timestamp: new Date(),
          isHealthRelated: response.isHealthRelated,
          recommendedProducts: response.recommendedProducts || [],
        };

        console.log("💬 Assistant Message:", assistantMessage);
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setError(response.message || "Terjadi kesalahan. Silakan coba lagi.");
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Error sending message:", err);
      setError(
        error.response?.data?.message ||
          "Gagal menghubungi asisten kesehatan. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyboardInput = (key: string) => {
    setInputMessage((prev) => prev + key);
  };

  const handleKeyboardBackspace = () => {
    setInputMessage((prev) => prev.slice(0, -1));
  };

  const suggestedQuestions = [
    "Apa obat untuk sakit kepala?",
    "Bagaimana cara mengatasi flu?",
    "Vitamin untuk daya tahan tubuh?",
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-teal-400 hover:bg-teal-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 z-50 group"
        aria-label="Buka Asisten Kesehatan"
      >
        <svg
          className="w-7 h-7"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 512"
        >
          <path d="M352 0c0-17.7-14.3-32-32-32S288-17.7 288 0l0 64-96 0c-53 0-96 43-96 96l0 224c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-224c0-53-43-96-96-96l-96 0 0-64zM160 368c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zm120 0c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zm120 0c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zM224 176a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm144 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM64 224c0-17.7-14.3-32-32-32S0 206.3 0 224l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96zm544-32c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32z" />
        </svg>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-teal-400 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Bot className="w-5 h-5" />
          <span className="font-semibold">Asisten Kesehatan</span>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
        {/* Header */}
        <div className="bg-teal-400 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Asisten Kesehatan AI</h3>
              <p className="text-xs font-semibold text-teal-100">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Minimize"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-teal-50 to-white">
          {messages.map((message, index) => {
            console.log(`🔍 Rendering message ${index}:`, {
              role: message.role,
              hasProducts: !!message.recommendedProducts,
              productCount: message.recommendedProducts?.length || 0,
              products: message.recommendedProducts,
            });

            return (
              <div
                key={index}
                className={`flex gap-2 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-teal-500 to-teal-400"
                      : "bg-gradient-to-br from-teal-300 to-teal-400"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    // <Bot className="w-4 h-4 text-white" />
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 640 512"
                    >
                      <path d="M352 0c0-17.7-14.3-32-32-32S288-17.7 288 0l0 64-96 0c-53 0-96 43-96 96l0 224c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-224c0-53-43-96-96-96l-96 0 0-64zM160 368c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zm120 0c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zm120 0c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zM224 176a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm144 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM64 224c0-17.7-14.3-32-32-32S0 206.3 0 224l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96zm544-32c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32z" />
                    </svg>
                  )}
                </div>

                <div
                  className={`flex-1 max-w-[75%] ${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-xl text-sm shadow-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-tr-none"
                        : "bg-white text-gray-800 rounded-tl-none"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {message.content.replace(/\[PRODUCT:[^\]]+\]/g, "")}
                    </p>
                  </div>

                  {/* Recommended Products */}
                  {message.recommendedProducts &&
                    message.recommendedProducts.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <p className="text-xs text-gray-600 font-semibold">
                          🛒 Produk Tersedia:
                        </p>
                        {message.recommendedProducts.map((product) => (
                          <div
                            key={product.id}
                            className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex gap-3">
                              {product.image_url && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-gray-900 truncate">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {product.description}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-sm font-bold text-green-600">
                                    Rp {product.price?.toLocaleString("id-ID")}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      setCurrentScreen("product-detail");
                                      setIsOpen(false);
                                    }}
                                    className="bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                                  >
                                    <ShoppingCart className="w-3 h-3" />
                                    Beli
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  <div
                    className={`text-xs text-gray-500 mt-1 px-1 ${
                      message.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-teal-300 to-teal-400 flex items-center justify-center">
                {/* <Bot className="w-4 h-4 text-white" /> */}
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 512"
                >
                  <path d="M352 0c0-17.7-14.3-32-32-32S288-17.7 288 0l0 64-96 0c-53 0-96 43-96 96l0 224c0 53 43 96 96 96l256 0c53 0 96-43 96-96l0-224c0-53-43-96-96-96l-96 0 0-64zM160 368c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zm120 0c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zm120 0c0-13.3 10.7-24 24-24l32 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-32 0c-13.3 0-24-10.7-24-24zM224 176a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm144 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM64 224c0-17.7-14.3-32-32-32S0 206.3 0 224l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96zm544-32c-17.7 0-32 14.3-32 32l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32z" />
                </svg>
              </div>
              <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Berpikir...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {messages.length === 1 && !isLoading && (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-medium">
                Pertanyaan populer:
              </p>
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="w-full text-left p-2 bg-white hover:bg-teal-50 border border-gray-200 hover:border-teal-300 rounded-lg text-xs text-gray-700 transition-all"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white p-3 rounded-b-2xl">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onFocus={() => setShowKeyboard(true)}
              placeholder="Ketik pertanyaan..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Konsultasi dengan dokter untuk kondisi serius
          </p>
        </div>
      </div>

      {/* On-Screen Keyboard */}
      {showKeyboard && (
        <OnScreenKeyboard
          onKeyPress={handleKeyboardInput}
          onBackspace={handleKeyboardBackspace}
          onClose={() => setShowKeyboard(false)}
          currentValue={inputMessage}
        />
      )}
    </>
  );
}
