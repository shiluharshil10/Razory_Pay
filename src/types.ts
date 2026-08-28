export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: 'Electronics' | 'Audio' | 'Wearables' | 'Accessories';
  image: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  tag?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  shipping: number;
  total: number;
  customer: CustomerDetails;
  status: 'pending_payment' | 'payment_failed' | 'processing' | 'completed' | 'cancelled';
  failureReason?: string;
  failureCode?: string;
  createdAt: string;
  updatedAt: string;
  resumeToken?: string;
}

export interface PaymentFailureReport {
  id: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  issueType: 'payment_failed' | 'card_declined' | 'bank_otp_timeout' | 'gateway_error' | 'other';
  customerNotes?: string;
  status: 'submitted' | 'analyzing' | 'resolved';
  submittedAt: string;
  resolvedAt?: string;
  resolution?: AgentResolution;
}

export interface AgentResolution {
  reportId: string;
  orderId: string;
  customerEmail: string;
  rootCauseAnalysis: string;
  actionsTaken: string[];
  apologyDiscountCode: string;
  discountPercent: number;
  paymentContinueUrl: string;
  emailSubject: string;
  emailBodyHtml: string;
  emailSentAt: string;
  isDelivered: boolean;
  etherealPreviewUrl?: string;
}

export interface SentEmail {
  id: string;
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
  sentAt: string;
  orderId: string;
  resumeUrl: string;
  discountCode: string;
  etherealPreviewUrl?: string;
}
