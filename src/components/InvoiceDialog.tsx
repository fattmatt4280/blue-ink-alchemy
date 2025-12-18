import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Printer } from 'lucide-react';

interface ShippingAddress {
  name: string;
  company?: string | null;
  street1: string;
  street2?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string | null;
}

interface Order {
  id: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  shipping_info?: any;
}

interface Shipment {
  carrier?: string | null;
  service_level?: string | null;
  shippo_tracking_number?: string | null;
  tracking_url?: string | null;
  shipping_cost?: number | null;
}

interface InvoiceDialogProps {
  order: Order;
  shippingAddress?: ShippingAddress | null;
  shipment?: Shipment | null;
  trigger?: React.ReactNode;
}

export const InvoiceDialog = ({ order, shippingAddress, shipment, trigger }: InvoiceDialogProps) => {
  const [open, setOpen] = useState(false);

  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`;
  const subtotal = order.amount / 100;
  const shippingCost = shipment?.shipping_cost ? shipment.shipping_cost / 100 : 0;
  const total = subtotal + shippingCost;

  const normalizeAddress = (info: any): ShippingAddress | null => {
    if (!info) return null;
    return {
      name: info.name || `${info.firstName || ''} ${info.lastName || ''}`.trim() || 'Customer',
      company: info.company,
      street1: info.street1 || info.address || '',
      street2: info.street2,
      city: info.city || '',
      state: info.state || '',
      zip: info.zip || info.zipCode || '',
      country: info.country || 'US',
      phone: info.phone,
    };
  };

  const rawAddress = shippingAddress || order.shipping_info;
  const address = normalizeAddress(rawAddress);
  const customerEmail = order.email;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            padding: 40px; 
            background: white; 
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            position: relative;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.04;
            z-index: 0;
            pointer-events: none;
          }
          .watermark img {
            width: 400px;
            height: auto;
          }
          .content {
            position: relative;
            z-index: 1;
          }
          .header { 
            display: flex; 
            justify-content: space-between;
            align-items: flex-start; 
            margin-bottom: 40px; 
            border-bottom: 3px solid #333; 
            padding-bottom: 20px; 
          }
          .header-left {
            display: flex;
            align-items: flex-start;
          }
          .header-logo { 
            width: 80px; 
            height: auto; 
            margin-right: 15px; 
          }
          .header-info h1 { 
            margin: 0 0 5px 0; 
            font-size: 22px; 
            color: #333; 
          }
          .header-info p { 
            margin: 2px 0; 
            font-size: 11px; 
            color: #666; 
          }
          .header-right {
            text-align: right;
          }
          .invoice-title {
            font-size: 32px;
            font-weight: bold;
            color: #333;
            letter-spacing: 2px;
            margin-bottom: 5px;
          }
          .invoice-number {
            font-size: 14px;
            color: #666;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            background: #10b981;
            color: white;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 8px;
          }
          .invoice-meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 40px;
          }
          .meta-box {
            flex: 1;
          }
          .meta-box h3 {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #666;
            margin-bottom: 8px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .meta-box p {
            margin: 3px 0;
            font-size: 13px;
            color: #333;
          }
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px; 
          }
          .items-table th { 
            background-color: #333; 
            color: white; 
            padding: 12px; 
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .items-table th:last-child,
          .items-table td:last-child {
            text-align: right;
          }
          .items-table td { 
            border-bottom: 1px solid #eee; 
            padding: 14px 12px; 
            font-size: 13px;
          }
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
          }
          .totals-box {
            width: 280px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 13px;
            border-bottom: 1px solid #eee;
          }
          .totals-row.total {
            font-size: 16px;
            font-weight: bold;
            border-bottom: 2px solid #333;
            border-top: 2px solid #333;
            margin-top: 5px;
            padding: 12px 0;
          }
          .tracking-section {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #667eea;
            margin-bottom: 25px;
          }
          .tracking-section h3 {
            font-size: 12px;
            text-transform: uppercase;
            color: #333;
            margin-bottom: 10px;
          }
          .tracking-section p {
            font-size: 12px;
            color: #555;
            margin: 4px 0;
          }
          .disclaimers {
            background: #fff9e6;
            border: 1px solid #ffd700;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 25px;
          }
          .disclaimers h3 {
            font-size: 12px;
            text-transform: uppercase;
            color: #b8860b;
            margin-bottom: 10px;
          }
          .disclaimers p {
            font-size: 11px;
            color: #666;
            margin: 6px 0;
            line-height: 1.5;
          }
          .footer { 
            text-align: center; 
            color: #666; 
            font-size: 11px; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #eee; 
          }
          .footer p { margin: 4px 0; }
          .thank-you {
            text-align: center;
            font-size: 16px;
            color: #333;
            margin: 25px 0;
            font-weight: 500;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="watermark">
          <img src="/images/invoice-logo-watermark.jpeg" alt="" />
        </div>
        <div class="content">
          <div class="header">
            <div class="header-left">
              <img src="/images/invoice-logo-bw.jpeg" alt="Dream Tattoo Company" class="header-logo" />
              <div class="header-info">
                <h1>Dream Tattoo Company</h1>
                <p>Blue Dream Budder Premium Aftercare</p>
                <p>Email: support@dreamtattoocompany.com</p>
                <p>Website: www.bluedreambudder.com</p>
              </div>
            </div>
            <div class="header-right">
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-number">${invoiceNumber}</div>
              <div class="status-badge">${order.status.toUpperCase()}</div>
            </div>
          </div>
          
          <div class="invoice-meta">
            <div class="meta-box">
              <h3>Bill To</h3>
              ${address ? `
                <p><strong>${address.name}</strong></p>
                ${address.company ? `<p>${address.company}</p>` : ''}
                <p>${address.street1}</p>
                ${address.street2 ? `<p>${address.street2}</p>` : ''}
                <p>${address.city}, ${address.state} ${address.zip}</p>
                <p>${address.country}</p>
                ${address.phone ? `<p>Phone: ${address.phone}</p>` : ''}
              ` : ''}
              <p>Email: ${customerEmail}</p>
            </div>
            <div class="meta-box">
              <h3>Ship To</h3>
              ${address ? `
                <p><strong>${address.name}</strong></p>
                ${address.company ? `<p>${address.company}</p>` : ''}
                <p>${address.street1}</p>
                ${address.street2 ? `<p>${address.street2}</p>` : ''}
                <p>${address.city}, ${address.state} ${address.zip}</p>
                <p>${address.country}</p>
              ` : `<p><em>Address not available</em></p>`}
            </div>
            <div class="meta-box">
              <h3>Invoice Details</h3>
              <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
              <p><strong>Date:</strong> ${orderDate}</p>
              <p><strong>Order ID:</strong> ${order.id.slice(0, 8).toUpperCase()}</p>
              <p><strong>Payment:</strong> Stripe</p>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 50%;">Description</th>
                <th style="width: 15%;">Qty</th>
                <th style="width: 15%;">Unit Price</th>
                <th style="width: 20%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Blue Dream Budder - Premium Tattoo Aftercare</strong><br>
                  <span style="font-size: 11px; color: #666;">All-natural healing formula for optimal tattoo recovery</span>
                </td>
                <td>1</td>
                <td>$${subtotal.toFixed(2)}</td>
                <td>$${subtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals-section">
            <div class="totals-box">
              <div class="totals-row">
                <span>Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
              </div>
              <div class="totals-row">
                <span>Shipping</span>
                <span>${shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Included'}</span>
              </div>
              <div class="totals-row">
                <span>Tax</span>
                <span>$0.00</span>
              </div>
              <div class="totals-row total">
                <span>Total</span>
                <span>$${total.toFixed(2)} ${order.currency?.toUpperCase() || 'USD'}</span>
              </div>
            </div>
          </div>

          ${shipment?.shippo_tracking_number ? `
            <div class="tracking-section">
              <h3>📦 Shipping Information</h3>
              <p><strong>Carrier:</strong> ${shipment.carrier || 'N/A'}</p>
              <p><strong>Service:</strong> ${shipment.service_level || 'N/A'}</p>
              <p><strong>Tracking Number:</strong> ${shipment.shippo_tracking_number}</p>
              ${shipment.tracking_url ? `<p><strong>Track Package:</strong> <a href="${shipment.tracking_url}" target="_blank">${shipment.tracking_url}</a></p>` : ''}
            </div>
          ` : ''}

          <div class="disclaimers">
            <h3>⚠️ Important Information</h3>
            <p><strong>Return Policy:</strong> We accept returns within 30 days of purchase for unopened products only. Please contact support@dreamtattoocompany.com to initiate a return.</p>
            <p><strong>Allergy Warning:</strong> Please review the ingredient list before use. Discontinue use immediately if irritation occurs and consult a healthcare professional.</p>
            <p><strong>Medical Disclaimer:</strong> This product is for external use only and is not intended to diagnose, treat, cure, or prevent any disease. For severe reactions, please seek medical attention.</p>
          </div>

          <div class="thank-you">
            Thank you for your business! 💜
          </div>

          <div class="footer">
            <p>Dream Tattoo Company | Blue Dream Budder Premium Aftercare</p>
            <p>Questions? Contact us at support@dreamtattoocompany.com</p>
            <p>© ${new Date().getFullYear()} Dream Tattoo Company. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200">
            <FileText className="h-4 w-4 mr-1" />
            View Invoice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice {invoiceNumber}</span>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print Invoice
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="border rounded-lg p-6 bg-white text-foreground relative">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <img src="/images/invoice-logo-watermark.jpeg" alt="" className="w-80 h-auto" />
          </div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-foreground pb-4 mb-6">
              <div className="flex items-start">
                <img src="/images/invoice-logo-bw.jpeg" alt="Dream Tattoo Company" className="w-16 h-auto mr-4" />
                <div>
                  <h1 className="text-xl font-bold">Dream Tattoo Company</h1>
                  <p className="text-sm text-muted-foreground">Blue Dream Budder Premium Aftercare</p>
                  <p className="text-sm text-muted-foreground">support@dreamtattoocompany.com</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold tracking-wide">INVOICE</h2>
                <p className="text-sm text-muted-foreground">{invoiceNumber}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded">
                  {order.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <h3 className="text-xs uppercase tracking-wide text-muted-foreground border-b pb-1 mb-2">Bill To</h3>
                {address && (
                  <>
                    <p className="font-medium text-sm">{address.name}</p>
                    {address.company && <p className="text-sm text-muted-foreground">{address.company}</p>}
                    <p className="text-sm text-muted-foreground">{address.street1}</p>
                    {address.street2 && <p className="text-sm text-muted-foreground">{address.street2}</p>}
                    <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.zip}</p>
                    <p className="text-sm text-muted-foreground">{address.country}</p>
                    {address.phone && <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>}
                  </>
                )}
                <p className="text-sm text-muted-foreground">{customerEmail}</p>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wide text-muted-foreground border-b pb-1 mb-2">Ship To</h3>
                {address ? (
                  <>
                    <p className="font-medium text-sm">{address.name}</p>
                    {address.company && <p className="text-sm text-muted-foreground">{address.company}</p>}
                    <p className="text-sm text-muted-foreground">{address.street1}</p>
                    {address.street2 && <p className="text-sm text-muted-foreground">{address.street2}</p>}
                    <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.zip}</p>
                    <p className="text-sm text-muted-foreground">{address.country}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Address not available</p>
                )}
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-wide text-muted-foreground border-b pb-1 mb-2">Invoice Details</h3>
                <p className="text-sm"><strong>Invoice #:</strong> {invoiceNumber}</p>
                <p className="text-sm"><strong>Date:</strong> {orderDate}</p>
                <p className="text-sm"><strong>Order ID:</strong> {order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm"><strong>Payment:</strong> Stripe</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr className="bg-foreground text-background">
                  <th className="p-3 text-left text-xs uppercase tracking-wide">Description</th>
                  <th className="p-3 text-center text-xs uppercase tracking-wide">Qty</th>
                  <th className="p-3 text-right text-xs uppercase tracking-wide">Unit Price</th>
                  <th className="p-3 text-right text-xs uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <p className="font-medium">Blue Dream Budder - Premium Tattoo Aftercare</p>
                    <p className="text-xs text-muted-foreground">All-natural healing formula for optimal tattoo recovery</p>
                  </td>
                  <td className="p-3 text-center">1</td>
                  <td className="p-3 text-right">${subtotal.toFixed(2)}</td>
                  <td className="p-3 text-right">${subtotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b text-sm">
                  <span>Shipping</span>
                  <span>{shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Included'}</span>
                </div>
                <div className="flex justify-between py-2 border-b text-sm">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-b-2 border-foreground font-bold text-lg mt-1">
                  <span>Total</span>
                  <span>${total.toFixed(2)} {order.currency?.toUpperCase() || 'USD'}</span>
                </div>
              </div>
            </div>

            {/* Tracking Info */}
            {shipment?.shippo_tracking_number && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
                <h3 className="font-semibold text-sm mb-2">📦 Shipping Information</h3>
                <p className="text-sm"><strong>Carrier:</strong> {shipment.carrier || 'N/A'}</p>
                <p className="text-sm"><strong>Service:</strong> {shipment.service_level || 'N/A'}</p>
                <p className="text-sm"><strong>Tracking:</strong> {shipment.shippo_tracking_number}</p>
                {shipment.tracking_url && (
                  <p className="text-sm">
                    <strong>Track:</strong>{' '}
                    <a href={shipment.tracking_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      {shipment.tracking_url}
                    </a>
                  </p>
                )}
              </div>
            )}

            {/* Disclaimers */}
            <div className="bg-amber-50 border border-amber-300 p-4 rounded mb-6">
              <h3 className="font-semibold text-sm text-amber-800 mb-2">⚠️ Important Information</h3>
              <p className="text-xs text-muted-foreground mb-2">
                <strong>Return Policy:</strong> We accept returns within 30 days of purchase for unopened products only.
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                <strong>Allergy Warning:</strong> Please review the ingredient list before use. Discontinue use if irritation occurs.
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Medical Disclaimer:</strong> This product is for external use only and is not intended to diagnose, treat, cure, or prevent any disease.
              </p>
            </div>

            {/* Thank You */}
            <p className="text-center text-lg font-medium mb-6">Thank you for your business! 💜</p>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground border-t pt-4">
              <p>Dream Tattoo Company | Blue Dream Budder Premium Aftercare</p>
              <p>Questions? Contact us at support@dreamtattoocompany.com</p>
              <p>© {new Date().getFullYear()} Dream Tattoo Company. All rights reserved.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
