import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { PaymentFailedView } from './components/PaymentFailedView';
import { ResumedCheckoutView } from './components/ResumedCheckoutView';
import { EmailInboxModal } from './components/EmailInboxModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { QuickTestModal } from './components/QuickTestModal';
import { ReportIssueModal, ReportCategory } from './components/ReportIssueModal';
import { Product, CartItem, Order, CustomerDetails, SentEmail } from './types';
import { Search } from 'lucide-react';

const DEFAULT_CART_ITEMS: CartItem[] = [
  {
    product: {
      id: "prod-2",
      name: "Minimalist Mechanical Keyboard 75%",
      price: 3999,
      originalPrice: 4999,
      description: "Solid CNC aluminum case, lubricated hot-swappable tactile switches, per-key RGB backlighting, and sound-dampening silicone gasket mount.",
      category: "Electronics",
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
      rating: 4.8,
      reviewsCount: 198,
      inStock: true,
      tag: "Staff Pick",
    },
    quantity: 1,
  },
  {
    product: {
      id: "prod-1",
      name: "Aura Studio Noise-Cancelling Headphones",
      price: 8499,
      originalPrice: 10999,
      description: "Ultra-low latency wireless audio with bespoke 40mm beryllium acoustic drivers, active ambient cancellation, and 42-hour battery life.",
      category: "Audio",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      rating: 4.9,
      reviewsCount: 342,
      inStock: true,
      tag: "Best Seller",
    },
    quantity: 1,
  },
  {
    product: {
      id: "prod-5",
      name: "Anodized Aluminum MagSafe Desk Stand",
      price: 1899,
      originalPrice: 2499,
      description: "Weighted anti-slip base with 360-degree rotation and 15W rapid wireless magnetic charging for smartphones and earbuds.",
      category: "Accessories",
      image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=80",
      rating: 4.6,
      reviewsCount: 88,
      inStock: true,
    },
    quantity: 2,
  },
  {
    product: {
      id: "prod-3",
      name: "Ceramic Smart Mug & Induction Warmer",
      price: 2499,
      originalPrice: 2999,
      description: "Precision temperature control from 120°F to 145°F with wireless Qi charging coaster and all-day heat retention for artisanal coffee & tea.",
      category: "Accessories",
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
      rating: 4.7,
      reviewsCount: 145,
      inStock: true,
    },
    quantity: 1,
  },
  {
    product: {
      id: "prod-6",
      name: "Leather Minimalist Tech Organizer Folio",
      price: 1999,
      originalPrice: 2499,
      description: "Full-grain vegetable-tanned leather folio with dedicated slots for cables, charger bricks, stylus pen, cards, and passport.",
      category: "Accessories",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
      rating: 4.8,
      reviewsCount: 112,
      inStock: true,
    },
    quantity: 1,
  },
];

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Initialize with pre-populated cart if empty
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('demo_store_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_CART_ITEMS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItemNotice, setAddedItemNotice] = useState<string | null>(null);

  // Modals & Active Views
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isQuickTestOpen, setIsQuickTestOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState<ReportCategory>('failed_payment');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Failure & Resumed Checkout states
  const [failedOrderInfo, setFailedOrderInfo] = useState<{
    orderId: string;
    errorReason: string;
    failureCode: string;
    customer: CustomerDetails;
    items: CartItem[];
    subtotal: number;
    total: number;
  } | null>(null);

  const [resumedOrderParam, setResumedOrderParam] = useState<{
    orderId: string;
    token?: string;
  } | null>(null);

  // Sent Emails for Demo Mailbox
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem('demo_store_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Load products & fetch initial emails
  useEffect(() => {
    async function initData() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to load products from API, using fallback:', err);
      } finally {
        setLoadingProducts(false);
      }

      // Check URL parameters for ?resumeOrder=ORD-XXX
      const params = new URLSearchParams(window.location.search);
      const resumeOrderId = params.get('resumeOrder');
      const token = params.get('token');
      if (resumeOrderId) {
        setResumedOrderParam({ orderId: resumeOrderId, token: token || undefined });
      }

      fetchSentEmails();
    }

    initData();
  }, []);

  const fetchSentEmails = async () => {
    try {
      const res = await fetch('/api/agent/emails');
      const data = await res.json();
      if (data.emails) {
        setSentEmails(data.emails);
      }
    } catch (err) {
      console.warn('Could not fetch emails:', err);
    }
  };

  const handleClearEmails = async () => {
    try {
      await fetch('/api/agent/emails', { method: 'DELETE' });
      setSentEmails([]);
    } catch (err) {
      console.error('Could not clear emails:', err);
      setSentEmails([]);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setAddedItemNotice(product.id);
    setTimeout(() => setAddedItemNotice(null), 1500);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Checkout Execution
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleProcessPayment = async ({
    customer,
    simulateFailure,
    failureType,
    discount,
  }: {
    customer: CustomerDetails;
    simulateFailure: boolean;
    failureType: string;
    discount: number;
  }) => {
    setIsProcessingPayment(true);
    try {
      const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      const shipping = subtotal >= 2000 ? 0 : 99;
      const total = Math.max(0, subtotal - discount + shipping);

      const res = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customer,
          simulateFailure,
          failureType,
          discount,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Payment failed! Transition to Payment Failed & Issue Report View
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        setFailedOrderInfo({
          orderId: data.orderId || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          errorReason: data.error || 'Card authorization timed out',
          failureCode: data.failureCode || 'PAY_GW_ERROR',
          customer,
          items: [...cart],
          subtotal,
          total,
        });
        fetchSentEmails();
      } else {
        // Payment succeeded
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        setCart([]);
        setCompletedOrder(data.order);
      }
    } catch (err: any) {
      alert(err.message || 'Payment execution failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Direct resume from email or link
  const handleResumeFromEmail = (resumeUrl: string) => {
    setIsInboxOpen(false);
    try {
      const url = new URL(resumeUrl, window.location.href);
      const orderId = url.searchParams.get('resumeOrder');
      const token = url.searchParams.get('token');
      if (orderId) {
        setFailedOrderInfo(null);
        setResumedOrderParam({ orderId, token: token || undefined });
        window.history.pushState({}, '', `?resumeOrder=${encodeURIComponent(orderId)}${token ? `&token=${encodeURIComponent(token)}` : ''}`);
        return;
      }
    } catch {
      // Direct regex string parsing fallback
      const orderMatch = resumeUrl.match(/resumeOrder=([^&]+)/);
      const tokenMatch = resumeUrl.match(/token=([^&]+)/);
      if (orderMatch && orderMatch[1]) {
        const orderId = decodeURIComponent(orderMatch[1]);
        const token = tokenMatch && tokenMatch[1] ? decodeURIComponent(tokenMatch[1]) : undefined;
        setFailedOrderInfo(null);
        setResumedOrderParam({ orderId, token });
        window.history.pushState({}, '', `?resumeOrder=${encodeURIComponent(orderId)}${token ? `&token=${encodeURIComponent(token)}` : ''}`);
      }
    }
  };

  // Trigger test email
  const handleTriggerTestEmail = async (email: string, name: string = 'Shopper') => {
    const res = await fetch('/api/agent/test-demo-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to dispatch demo email');
    }
    await fetchSentEmails();
    return data;
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const categories = ['All', 'Audio', 'Electronics', 'Wearables', 'Accessories'];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <Navbar
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenInbox={() => {
          fetchSentEmails();
          setIsInboxOpen(true);
        }}
        emailCount={sentEmails.length}
        onOpenQuickTest={() => setIsQuickTestOpen(true)}
        onOpenReport={(cat) => {
          if (cat) setReportCategory(cat);
          setIsReportOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* CONDITIONAL VIEW 1: Resumed Checkout View (Loaded via Email Link or Agent Resolution) */}
        {resumedOrderParam ? (
          <ResumedCheckoutView
            orderId={resumedOrderParam.orderId}
            token={resumedOrderParam.token}
            onBackToStore={() => {
              setResumedOrderParam(null);
              // Clean URL query parameter
              window.history.replaceState({}, document.title, window.location.pathname);
            }}
            onOrderCompleted={(order) => {
              setResumedOrderParam(null);
              setCart([]);
              setCompletedOrder(order);
              window.history.replaceState({}, document.title, window.location.pathname);
            }}
          />
        ) : failedOrderInfo ? (
          /* CONDITIONAL VIEW 2: Payment Failed & Report Section */
          <div className="space-y-4">
            <button
              onClick={() => setFailedOrderInfo(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
            >
              ← Return to Catalog
            </button>
            <PaymentFailedView
              orderId={failedOrderInfo.orderId}
              errorReason={failedOrderInfo.errorReason}
              failureCode={failedOrderInfo.failureCode}
              customer={failedOrderInfo.customer}
              items={failedOrderInfo.items}
              subtotal={failedOrderInfo.subtotal}
              total={failedOrderInfo.total}
              onRetryNormal={() => {
                setFailedOrderInfo(null);
                setIsCheckoutOpen(true);
              }}
              onOpenInbox={() => {
                fetchSentEmails();
                setIsInboxOpen(true);
              }}
              onResumeOrderDirectly={(orderId) => {
                setFailedOrderInfo(null);
                setResumedOrderParam({ orderId });
              }}
            />
          </div>
        ) : (
          /* CONDITIONAL VIEW 3: Standard Simple E-Commerce Storefront */
          <div className="space-y-6 animate-fadeIn">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              {/* Category Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search catalog..."
                  className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
              </div>
            </div>

            {/* Products Grid */}
            {loadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse p-4 space-y-4">
                    <div className="h-44 bg-slate-100 rounded-xl" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                <p className="text-slate-800 font-semibold text-sm">No products found matching "{searchQuery}"</p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    isAdded={addedItemNotice === product.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        appliedDiscount={0}
        onProcessPayment={handleProcessPayment}
        isProcessing={isProcessingPayment}
      />

      {/* Support / Demo Mailbox Modal */}
      <EmailInboxModal
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        emails={sentEmails}
        onRefreshEmails={fetchSentEmails}
        onClearEmails={handleClearEmails}
        onTriggerTestEmail={(email) => handleTriggerTestEmail(email)}
        onResumeFromEmail={handleResumeFromEmail}
        defaultEmail="shiluharshil10@gmail.com"
      />

      {/* Quick Test Demo Email Modal */}
      <QuickTestModal
        isOpen={isQuickTestOpen}
        onClose={() => setIsQuickTestOpen(false)}
        onSendTestEmail={handleTriggerTestEmail}
        onOpenInbox={() => {
          fetchSentEmails();
          setIsInboxOpen(true);
        }}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />

      {/* Customer Report Issue Modal */}
      <ReportIssueModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        initialCategory={reportCategory}
        cartItems={cart}
        cartTotal={cart.reduce((s, i) => s + i.product.price * i.quantity, 0)}
        onReportSubmittedSuccess={() => {
          fetchSentEmails();
        }}
        onOpenInbox={() => {
          fetchSentEmails();
          setIsInboxOpen(true);
        }}
        onResumeOrder={(orderId) => {
          setFailedOrderInfo(null);
          setResumedOrderParam({ orderId });
        }}
      />
    </div>
  );
}
