import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import type { SiteSettings } from "@/contexts/SettingsContext";

interface Payment {
  id: number; bookingId: number; amount: number; discountAmount: number;
  status: string; method: string; paymentRef: string; promoCode: string | null;
  paidAt: string | null; createdAt: string;
}

const statusBadge: Record<string, string> = {
  paid: "bg-green-500/10 text-green-500 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

function generateInvoiceHTML(
  p: Payment,
  user: { name: string; email: string },
  s: SiteSettings | null
) {
  const hotelName = s?.hotelName ?? "Grand Azure Hotel";
  const address = s?.address ?? "1 Grand Azure Boulevard, Monaco MC 98000";
  const phone = s?.phone ?? "+1 (800) 555-0100";
  const email = s?.email ?? "reservations@grandazure.com";
  const currency = s?.currency ?? "USD";
  const currencySymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency;

  return `
<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:Arial,sans-serif;color:#111;margin:0;padding:40px;background:#fff}
  .header{border-bottom:3px solid #b8962e;padding-bottom:20px;margin-bottom:30px}
  .logo{font-size:24px;font-weight:bold;color:#b8962e}
  .sub{font-size:11px;letter-spacing:0.2em;color:#b8962e;text-transform:uppercase}
  h2{font-size:28px;margin:0 0 4px;color:#111}
  .meta{color:#666;font-size:13px}
  table{width:100%;border-collapse:collapse;margin:24px 0}
  td,th{padding:10px 12px;text-align:left;font-size:13px}
  thead td{background:#f5f5f5;font-weight:600;color:#444;font-size:12px;text-transform:uppercase;letter-spacing:0.05em}
  tbody tr:nth-child(even){background:#fafafa}
  .total{font-size:18px;font-weight:bold;color:#b8962e}
  .footer{margin-top:40px;padding-top:20px;border-top:1px solid #eee;font-size:11px;color:#999;text-align:center}
  .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:${p.status === "paid" ? "#d4edda" : "#fff3cd"};color:${p.status === "paid" ? "#155724" : "#856404"}}
</style></head>
<body>
<div class="header">
  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    <div><div class="logo">${hotelName}</div><div class="sub">Hotel & Residences</div></div>
    <div style="text-align:right"><h2>INVOICE</h2><div class="meta">#${p.paymentRef}</div><div class="meta">Date: ${new Date(p.createdAt).toLocaleDateString()}</div></div>
  </div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:30px">
  <div><p style="font-size:11px;color:#999;margin-bottom:4px;text-transform:uppercase">Bill To</p><p style="font-weight:600;margin:0">${user.name}</p><p style="color:#666;font-size:13px;margin:2px 0">${user.email}</p></div>
  <div style="text-align:right"><p style="font-size:11px;color:#999;margin-bottom:4px;text-transform:uppercase">Status</p><span class="badge">${p.status.toUpperCase()}</span>${p.paidAt ? `<p style="color:#666;font-size:12px;margin:4px 0">Paid: ${new Date(p.paidAt).toLocaleDateString()}</p>` : ""}</div>
</div>
<table>
  <thead><tr><td>Description</td><td>Booking</td><td>Method</td><td style="text-align:right">Amount</td></tr></thead>
  <tbody>
    <tr><td>Room Reservation</td><td>#${p.bookingId}</td><td style="text-transform:capitalize">${p.method}</td><td style="text-align:right">${currencySymbol}${(p.amount + p.discountAmount).toFixed(2)}</td></tr>
    ${p.discountAmount > 0 ? `<tr><td colspan="3" style="color:#22863a">Promo Discount${p.promoCode ? ` (${p.promoCode})` : ""}</td><td style="text-align:right;color:#22863a">-${currencySymbol}${p.discountAmount.toFixed(2)}</td></tr>` : ""}
    <tr style="border-top:2px solid #eee"><td colspan="3" style="font-weight:600">Total</td><td style="text-align:right" class="total">${currencySymbol}${p.amount.toFixed(2)}</td></tr>
  </tbody>
</table>
<div class="footer"><p>${hotelName} & Residences · ${address}</p><p>${phone} · ${email}</p><p style="margin-top:8px">Thank you for choosing ${hotelName}</p></div>
</body></html>`;
}

export default function InvoicePage() {
  const { token, user } = useAuth();
  const { settings } = useSettings();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/payments", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setPayments(await res.json());
    setLoading(false);
  };

  useState(() => { load(); });

  const downloadInvoice = (p: Payment) => {
    if (!user) return;
    const html = generateInvoiceHTML(p, { name: user.name, email: user.email }, settings);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${p.paymentRef}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--app-font-serif)] text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground text-sm mt-1">Your payment history and downloadable invoices</p>
          </div>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No invoices yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">Booking #{p.bookingId}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.paymentRef}</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-primary">${p.amount.toFixed(2)}</p>
                    {p.discountAmount > 0 && <p className="text-xs text-green-500">-${p.discountAmount.toFixed(2)} off</p>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${statusBadge[p.status]}`}>{p.status}</span>
                  <Button size="sm" variant="outline" onClick={() => downloadInvoice(p)} className="h-8">
                    <Download className="w-3.5 h-3.5 mr-1" />Download
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
