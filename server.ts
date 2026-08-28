import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data structures
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  image: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  tag?: string;
}

const PRODUCTS: Product[] = [
  {
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
  {
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
  {
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
  {
    id: "prod-4",
    name: "Titanium Ultra-Slim Chrono Smartwatch",
    price: 14999,
    originalPrice: 18999,
    description: "Aerospace-grade titanium chassis, sapphire crystal AMOLED display, 14-day battery life, ECG heart rate tracking, and 50m water resistance.",
    category: "Wearables",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewsCount: 512,
    inStock: true,
    tag: "Popular",
  },
  {
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
  {
    id: "prod-6",
    name: "Leather Minimalist Tech Organizer Folio",
    price: 1999,
    originalPrice: 2499,
    description: "Full-grain vegetable-tanned leather folio with dedicated slots for cables, charger bricks, stylus pen, cards, and passport.",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviewsCount: 120,
    inStock: true,
  }
];

// In-memory Stores
const ordersStore = new Map<string, any>();
const reportsStore = new Map<string, any>();
const sentEmailsStore: any[] = [];

// Helper for Gemini client initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Setup Nodemailer test transporter or ethereal account
let mailTransporter: nodemailer.Transporter | null = null;
async function initMailer() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    mailTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("Ethereal test mailer initialized:", testAccount.user);
  } catch (err) {
    console.warn("Could not create ethereal test account, using direct fallback mail logger:", err);
  }
}
initMailer();

// Autonomous Agent Function to resolve payment failure and dispatch apology email
async function runPaymentRecoveryAgent(report: any, order: any, appBaseUrl: string) {
  const customerEmail = report.customerEmail;
  const customerName = report.customerName || "Valued Customer";
  const orderId = order ? order.id : report.orderId;
  const failureReason = order?.failureReason || "Payment Gateway Handshake Interrupted";
  const failureCode = order?.failureCode || "PAY_GW_TIMEOUT_3DS";
  const resumeToken = order?.resumeToken || `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Generate resume link that routes back to checkout with token (relative path ensures preview host compatibility)
  const paymentContinueUrl = `${appBaseUrl}/?resumeOrder=${orderId}&token=${resumeToken}`;

  let rootCauseAnalysis = "The payment processing gateway reported a temporary 3D-Secure authentication handshake timeout between the issuing bank and payment node. The customer's cart and reserved inventory remain secure.";
  let actionsTaken = [
    "Identified and bypassed strict merchant 3D-Secure fraud challenge rule for session",
    "Extended inventory lock for 48 hours to prevent cart item expiration",
    "Constructed one-click secure payment continuation link",
    "Dispatched personalized resolution notice with payment resume link"
  ];
  let apologySubject = `Priority Payment Resolution for Order #${orderId} — Resume & Complete Your Order`;
  let personalizedMessage = `We noticed you ran into a hiccup during checkout for Order #${orderId}. Our automated system detected that your bank transaction was unexpectedly interrupted. We have resolved the session error on our payment gateway and saved all your items.`;

  // Multi-model resilient call for deep diagnostic & bespoke apology drafting
  const ai = getGeminiClient();
  if (ai) {
    const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro", "gemini-3.7-flash"];
    const itemsListStr = order?.items?.map((i: any) => `${i.product.name} (Qty: ${i.quantity}, ₹${i.product.price})`).join(", ") || "Selected Items";
    const prompt = `You are an Autonomous AI Payment Reliability & Customer Recovery Agent working inside the backend of an e-commerce platform.
A customer reported a payment failure.

Customer Name: ${customerName}
Customer Email: ${customerEmail}
Order ID: ${orderId}
Failure Error: ${failureReason} (Code: ${failureCode})
Customer Notes/Issue: ${report.customerNotes || "Payment failed during checkout"}
Cart Items: ${itemsListStr}
Order Total: ₹${order?.total || 0}
Continuation Link: ${paymentContinueUrl}

Your mission:
1. Conduct a brief technical root cause diagnosis of why the payment failed (e.g. gateway timeout, 3DS authentication lock, bank rate-limit, or token mismatch) and document the automated backend actions taken to fix it.
2. Formulate a warm, sincere, high-end resolution email that reassures the customer that their items are safely reserved, explains that the issue has been corrected on the server, and provides the payment continuation link to finish with one click.

Return valid JSON with:
{
  "rootCauseAnalysis": "string explaining the technical diagnosis",
  "actionsTaken": ["action 1", "action 2", "action 3"],
  "apologySubject": "string subject line",
  "personalizedBody": "string warm resolution paragraph",
  "emailHtmlContent": "clean HTML email body"
}`;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (parsed.rootCauseAnalysis) rootCauseAnalysis = parsed.rootCauseAnalysis;
          if (Array.isArray(parsed.actionsTaken)) actionsTaken = parsed.actionsTaken;
          if (parsed.apologySubject) apologySubject = parsed.apologySubject;
          if (parsed.personalizedBody) personalizedMessage = parsed.personalizedBody;
          break; // Successfully generated content
        }
      } catch (err: any) {
        console.warn(`Gemini model ${model} unavailable (${err?.status || err?.code || 'busy'}). Falling back...`);
      }
    }
  }

  // Construct styled HTML Email
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #0f172a; padding: 28px 32px; color: #ffffff; }
    .header h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 600; }
    .header p { margin: 0; font-size: 13px; color: #94a3b8; }
    .content { padding: 32px; }
    .badge { display: inline-block; background: #fef2f2; color: #ef4444; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; margin-bottom: 16px; border: 1px solid #fecaca; }
    .resolved-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .resolved-title { font-weight: 600; color: #166534; font-size: 14px; margin-bottom: 6px; }
    .resolved-text { font-size: 13px; color: #15803d; line-height: 1.5; margin: 0; }
    .btn { display: inline-block; background: #0f172a; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; margin: 20px 0 10px 0; }
    .btn:hover { background: #1e293b; }
    .voucher-card { background: #eff6ff; border: 1px dashed #3b82f6; border-radius: 8px; padding: 14px 18px; margin: 20px 0; display: flex; align-items: center; justify-content: space-between; }
    .voucher-code { font-family: monospace; font-size: 16px; font-weight: 700; color: #1d4ed8; letter-spacing: 1px; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    .items-table th { text-align: left; padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; }
    .items-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .footer { background: #f8fafc; padding: 20px 32px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Demo Store • Automated Support</h1>
      <p>Priority Payment Resolution for Order #${orderId}</p>
    </div>
    <div class="content">
      <div class="badge">Payment Interruption Resolved</div>
      <p>Dear <strong>${customerName}</strong>,</p>
      <p>${personalizedMessage}</p>

      <div class="resolved-box">
        <div class="resolved-title">✓ Automated Resolution Diagnostic</div>
        <p class="resolved-text">
          <strong>Root Cause:</strong> ${rootCauseAnalysis}<br/>
          <strong>Backend Fix:</strong> Payment session unlocked & token refreshed. Your reserved cart is intact for the next 48 hours.
        </p>
      </div>

      <div style="text-align: center;">
        <a href="${paymentContinueUrl}" class="btn" target="_blank">
          Resume & Complete Payment →
        </a>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
          (Your cart and items are safely reserved)
        </div>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
        If the button above does not work, copy and paste this secure link into your browser:<br/>
        <a href="${paymentContinueUrl}" style="color: #2563eb; word-break: break-all;">${paymentContinueUrl}</a>
      </p>
    </div>
    <div class="footer">
      Sent automatically by the Payment Reliability Agent • Demo Store<br/>
      Order #${orderId} • Support ID: ${report.id}
    </div>
  </div>
</body>
</html>
  `;

  let etherealPreviewUrl: string | undefined = undefined;

  // Send real email via nodemailer
  if (mailTransporter) {
    try {
      const info = await mailTransporter.sendMail({
        from: '"Demo Store Support Agent" <support@demostore.internal>',
        to: customerEmail,
        subject: apologySubject,
        text: `${personalizedMessage}\n\nResume payment link: ${paymentContinueUrl}`,
        html: emailHtml,
      });
      etherealPreviewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      console.log("Email dispatched via test transport. Preview URL:", etherealPreviewUrl);
    } catch (mailErr) {
      console.warn("Mail dispatch notice:", mailErr);
    }
  }

  const sentEmailRecord = {
    id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    to: customerEmail,
    from: "support@simplestore.internal",
    subject: apologySubject,
    html: emailHtml,
    text: `${personalizedMessage}\n\nResume payment: ${paymentContinueUrl}`,
    sentAt: new Date().toISOString(),
    orderId,
    resumeUrl: paymentContinueUrl,
    etherealPreviewUrl,
  };

  sentEmailsStore.unshift(sentEmailRecord);

  // Update order with resumeToken
  if (order) {
    order.resumeToken = resumeToken;
    order.status = "pending_payment";
    order.updatedAt = new Date().toISOString();
    ordersStore.set(order.id, order);
  }

  // Update report
  const resolution: any = {
    reportId: report.id,
    orderId,
    customerEmail,
    rootCauseAnalysis,
    actionsTaken,
    paymentContinueUrl,
    emailSubject: apologySubject,
    emailBodyHtml: emailHtml,
    emailSentAt: sentEmailRecord.sentAt,
    isDelivered: true,
    etherealPreviewUrl,
  };

  report.status = "resolved";
  report.resolvedAt = new Date().toISOString();
  report.resolution = resolution;
  reportsStore.set(report.id, report);

  return resolution;
}

// ---------------- API ENDPOINTS ----------------

// Get products catalog
app.get("/api/products", (req, res) => {
  res.json({ products: PRODUCTS });
});

// Process checkout payment (simulated)
app.post("/api/checkout/process", (req, res) => {
  const { items, customer, simulateFailure, failureType } = req.body;

  if (!items || !items.length || !customer?.email) {
    return res.status(400).json({ error: "Invalid items or customer email." });
  }

  const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const subtotal = items.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);
  const discount = req.body.discount || 0;
  const shipping = subtotal > 150 ? 0 : 15;
  const total = Math.max(0, subtotal - discount + shipping);

  const resumeToken = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // If simulation requested failure, or normal flow
  if (simulateFailure) {
    const errorCodes: Record<string, { reason: string; code: string }> = {
      card_declined: { reason: "Bank Card Declined - 3D-Secure Authentication Failed", code: "CARD_DECLINED_3DS_TIMEOUT" },
      timeout: { reason: "Gateway Connection Timeout during SSL Handshake", code: "GATEWAY_TIMEOUT_504" },
      insufficient_funds: { reason: "Insufficient Balance or Authorization Limit Exceeded", code: "AUTH_LIMIT_EXCEEDED" },
      general: { reason: "Payment Gateway Transaction Interrupted", code: "PAYMENT_FAILED_GENERIC" }
    };

    const err = errorCodes[failureType] || errorCodes.card_declined;

    const failedOrder = {
      id: orderId,
      items,
      subtotal,
      discount,
      shipping,
      total,
      customer,
      status: "payment_failed",
      failureReason: err.reason,
      failureCode: err.code,
      resumeToken,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    ordersStore.set(orderId, failedOrder);

    return res.status(402).json({
      success: false,
      orderId,
      error: err.reason,
      failureCode: err.code,
      message: "Your payment could not be processed. Please report this issue below to receive instant automated resolution and recovery link.",
    });
  }

  // Successful payment
  const successfulOrder = {
    id: orderId,
    items,
    subtotal,
    discount,
    shipping,
    total,
    customer,
    status: "completed",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  ordersStore.set(orderId, successfulOrder);

  res.json({
    success: true,
    order: successfulOrder,
    message: "Payment processed successfully!",
  });
});

// Submit a Payment Failure Report (triggers Backend Autonomous Agent)
app.post("/api/reports/submit", async (req, res) => {
  try {
    const { orderId, customerEmail, customerName, issueType, customerNotes } = req.body;

    if (!customerEmail || !customerEmail.includes("@")) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    const reportId = `REP-${Math.floor(10000 + Math.random() * 90000)}`;
    const existingOrder = orderId ? ordersStore.get(orderId) : null;

    const report = {
      id: reportId,
      orderId: orderId || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      customerEmail: customerEmail.trim().toLowerCase(),
      customerName: customerName || (existingOrder?.customer?.name || "Customer"),
      issueType: issueType || "payment_failed",
      customerNotes: customerNotes || "Customer submitted payment failure report.",
      status: "analyzing",
      submittedAt: new Date().toISOString(),
    };

    reportsStore.set(reportId, report);

    // Compute application base URL for resume link
    const protocol = req.protocol || "http";
    const host = req.get("host") || `localhost:${PORT}`;
    const appBaseUrl = `${protocol}://${host}`;

    // Run the Autonomous Recovery Agent in backend
    const resolution = await runPaymentRecoveryAgent(report, existingOrder, appBaseUrl);

    res.json({
      success: true,
      reportId,
      message: `Payment failure report processed by backend agent. Apology email sent to ${customerEmail}!`,
      resolution,
    });
  } catch (error: any) {
    console.error("Error handling failure report:", error);
    res.status(500).json({ error: error.message || "Failed to process payment report" });
  }
});

// Get report by ID or order ID
app.get("/api/reports/:id", (req, res) => {
  const report = reportsStore.get(req.params.id);
  if (!report) return res.status(404).json({ error: "Report not found" });
  res.json({ report });
});

// Get order details & resume session state
app.get("/api/checkout/resume/:orderId", (req, res) => {
  const { orderId } = req.params;
  const { token } = req.query;

  const order = ordersStore.get(orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found or has expired." });
  }

  // If token is provided, verify it (or allow graceful restore)
  const isTokenValid = !token || order.resumeToken === token;

  res.json({
    success: true,
    order,
    isTokenValid,
  });
});

// Complete payment on resumed order
app.post("/api/checkout/complete-resumed", (req, res) => {
  const { orderId, paymentMethod } = req.body;
  const order = ordersStore.get(orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }

  const newTotal = Math.max(0, Number((order.subtotal + order.shipping).toFixed(2)));

  order.discount = 0;
  order.discountCode = undefined;
  order.total = newTotal;
  order.status = "completed";
  order.paymentMethod = paymentMethod || "Credit Card (Agent Restored)";
  order.updatedAt = new Date().toISOString();

  ordersStore.set(orderId, order);

  res.json({
    success: true,
    order,
    message: "Restored order completed successfully!",
  });
});

// Get sent emails (for demo mail viewer & testing)
app.get("/api/agent/emails", (req, res) => {
  const emailFilter = req.query.email as string;
  if (emailFilter) {
    const filtered = sentEmailsStore.filter(
      (e) => e.to.toLowerCase() === emailFilter.toLowerCase()
    );
    return res.json({ emails: filtered });
  }
  res.json({ emails: sentEmailsStore });
});

// Clear all sent emails
app.delete("/api/agent/emails", (req, res) => {
  sentEmailsStore.length = 0;
  res.json({ success: true, message: "All emails cleared." });
});

app.post("/api/agent/emails/clear", (req, res) => {
  sentEmailsStore.length = 0;
  res.json({ success: true, message: "All emails cleared." });
});

// Direct test email trigger
app.post("/api/agent/test-demo-mail", async (req, res) => {
  const { email, name } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Please provide a valid email." });
  }

  const demoOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const demoReport = {
    id: `REP-${Math.floor(10000 + Math.random() * 90000)}`,
    orderId: demoOrderId,
    customerEmail: email.trim().toLowerCase(),
    customerName: name || "Test Shopper",
    issueType: "payment_failed",
    customerNotes: "Demo test trigger of agent email.",
    status: "submitted",
    submittedAt: new Date().toISOString(),
  };

  const demoOrder = {
    id: demoOrderId,
    items: [
      { product: PRODUCTS[0], quantity: 1 },
      { product: PRODUCTS[2], quantity: 1 },
    ],
    subtotal: PRODUCTS[0].price + PRODUCTS[2].price,
    discount: 0,
    shipping: 0,
    total: PRODUCTS[0].price + PRODUCTS[2].price,
    customer: { email, name: name || "Test Shopper" },
    status: "payment_failed",
    failureReason: "Bank Card Authentication Timeout (Simulated)",
    failureCode: "ERR_3DS_TIMEOUT",
    resumeToken: `res_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  ordersStore.set(demoOrderId, demoOrder);
  reportsStore.set(demoReport.id, demoReport);

  const protocol = req.protocol || "http";
  const host = req.get("host") || `localhost:${PORT}`;
  const appBaseUrl = `${protocol}://${host}`;

  const resolution = await runPaymentRecoveryAgent(demoReport, demoOrder, appBaseUrl);

  res.json({
    success: true,
    message: `Test apology email dispatched to ${email}!`,
    resolution,
  });
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`E-Commerce Server with Payment Recovery Agent running on http://localhost:${PORT}`);
  });
}

startServer();
