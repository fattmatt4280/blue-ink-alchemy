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
}

interface PackingSlipDialogProps {
  order: Order;
  shippingAddress?: ShippingAddress | null;
  shipment?: Shipment | null;
  trigger?: React.ReactNode;
}

export const PackingSlipDialog = ({ order, shippingAddress, shipment, trigger }: PackingSlipDialogProps) => {
  const [open, setOpen] = useState(false);

  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Use shipping_info from order if shippingAddress not provided
  const address = shippingAddress || order.shipping_info;

  const handlePrint = () => {
    const printContent = document.getElementById('packing-slip-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Packing Slip - Order ${order.id.slice(0, 8)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            background: white; 
            color: #333;
            max-width: 800px;
            margin: 0 auto;
          }
          .header { 
            display: flex; 
            align-items: flex-start; 
            margin-bottom: 30px; 
            border-bottom: 3px solid #333; 
            padding-bottom: 20px; 
          }
          .header-logo { 
            width: 80px; 
            height: auto; 
            margin-right: 20px; 
          }
          .header-info h1 { 
            margin: 0 0 5px 0; 
            font-size: 24px; 
            color: #333; 
          }
          .header-info p { 
            margin: 2px 0; 
            font-size: 12px; 
            color: #666; 
          }
          .slip-title { 
            text-align: center; 
            margin: 30px 0; 
            font-size: 28px; 
            font-weight: bold;
            letter-spacing: 3px;
            color: #333;
          }
          .order-info { 
            background: #f5f5f5; 
            padding: 15px; 
            margin-bottom: 25px; 
            border-radius: 5px;
            font-size: 14px;
          }
          .addresses { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px; 
            gap: 40px;
          }
          .address-box { 
            flex: 1;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .address-box h3 { 
            margin: 0 0 10px 0; 
            font-size: 14px; 
            color: #333; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .address-box p { 
            margin: 4px 0; 
            font-size: 13px; 
            color: #555; 
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
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .items-table td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            font-size: 14px;
          }
          .shipping-info {
            background: #f0f7ff;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #667eea;
            margin-bottom: 25px;
          }
          .shipping-info h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #333;
          }
          .shipping-info p {
            margin: 5px 0;
            font-size: 13px;
            color: #555;
          }
          .tracking-line {
            border-bottom: 1px dashed #333;
            min-width: 200px;
            display: inline-block;
            margin-left: 5px;
          }
          .notes-section {
            border: 1px dashed #ccc;
            padding: 15px;
            margin-bottom: 25px;
            border-radius: 5px;
            min-height: 80px;
          }
          .notes-section h3 {
            margin: 0 0 10px 0;
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
          }
          .footer { 
            text-align: center; 
            color: #666; 
            font-size: 12px; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #eee; 
          }
          .footer p { margin: 5px 0; }
          .thank-you {
            text-align: center;
            font-size: 18px;
            color: #333;
            margin: 30px 0;
            font-weight: 500;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/images/invoice-logo-bw.jpeg" alt="Dream Tattoo Company" class="header-logo" />
          <div class="header-info">
            <h1>Dream Tattoo Company</h1>
            <p>Blue Dream Budder Premium Aftercare</p>
            <p>Email: support@dreamtattoocompany.com</p>
            <p>Website: www.bluedreambudder.com</p>
          </div>
        </div>
        
        <div class="slip-title">PACKING SLIP</div>
        
        <div class="order-info">
          <strong>Order #:</strong> ${order.id.slice(0, 8).toUpperCase()} &nbsp;&nbsp;|&nbsp;&nbsp;
          <strong>Date:</strong> ${orderDate}
        </div>

        <div class="addresses">
          <div class="address-box">
            <h3>Ship To</h3>
            ${address ? `
              <p><strong>${address.name || 'Customer'}</strong></p>
              ${address.company ? `<p>${address.company}</p>` : ''}
              <p>${address.street1 || ''}</p>
              ${address.street2 ? `<p>${address.street2}</p>` : ''}
              <p>${address.city || ''}, ${address.state || ''} ${address.zip || ''}</p>
              <p>${address.country || 'US'}</p>
              ${address.phone ? `<p>Phone: ${address.phone}</p>` : ''}
            ` : `
              <p>${order.email}</p>
              <p><em>Shipping address not available</em></p>
            `}
          </div>
          <div class="address-box">
            <h3>Ship From</h3>
            <p><strong>Dream Tattoo Company</strong></p>
            <p>Blue Dream Budder</p>
            <p>United States</p>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Size</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: center;">Packed ✓</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Blue Dream Budder - Premium Aftercare</td>
              <td>Standard</td>
              <td style="text-align: center;">1</td>
              <td style="text-align: center;">☐</td>
            </tr>
          </tbody>
        </table>

        <div class="shipping-info">
          <h3>📦 Shipping Details</h3>
          ${shipment?.carrier ? `<p><strong>Carrier:</strong> ${shipment.carrier}</p>` : '<p><strong>Carrier:</strong> _________________</p>'}
          ${shipment?.service_level ? `<p><strong>Service:</strong> ${shipment.service_level}</p>` : '<p><strong>Service:</strong> _________________</p>'}
          <p><strong>Tracking #:</strong> ${shipment?.shippo_tracking_number || '<span class="tracking-line"></span>'}</p>
        </div>

        <div class="notes-section">
          <h3>Special Instructions / Notes</h3>
        </div>

        <div class="thank-you">
          Thank you for your order! 💜
        </div>

        <div class="footer">
          <p>Questions? Contact us at support@dreamtattoocompany.com</p>
          <p>© ${new Date().getFullYear()} Dream Tattoo Company. All rights reserved.</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    // Small delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200">
            <FileText className="h-4 w-4 mr-1" />
            Packing Slip
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Packing Slip - Order #{order.id.slice(0, 8).toUpperCase()}</span>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div id="packing-slip-content" className="border rounded-lg p-6 bg-white text-foreground">
          {/* Header */}
          <div className="flex items-start border-b-2 border-foreground pb-4 mb-6">
            <img src="/images/invoice-logo-bw.jpeg" alt="Dream Tattoo Company" className="w-16 h-auto mr-4" />
            <div>
              <h1 className="text-xl font-bold">Dream Tattoo Company</h1>
              <p className="text-sm text-muted-foreground">Blue Dream Budder Premium Aftercare</p>
              <p className="text-sm text-muted-foreground">support@dreamtattoocompany.com</p>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center tracking-widest mb-6">PACKING SLIP</h2>

          {/* Order Info */}
          <div className="bg-muted p-3 rounded mb-6 text-sm">
            <strong>Order #:</strong> {order.id.slice(0, 8).toUpperCase()} &nbsp;|&nbsp;
            <strong>Date:</strong> {orderDate}
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border rounded p-4">
              <h3 className="font-semibold text-sm border-b pb-2 mb-2 uppercase tracking-wide">Ship To</h3>
              {address ? (
                <>
                  <p className="font-medium">{address.name || 'Customer'}</p>
                  {address.company && <p className="text-sm text-muted-foreground">{address.company}</p>}
                  <p className="text-sm text-muted-foreground">{address.street1}</p>
                  {address.street2 && <p className="text-sm text-muted-foreground">{address.street2}</p>}
                  <p className="text-sm text-muted-foreground">{address.city}, {address.state} {address.zip}</p>
                  <p className="text-sm text-muted-foreground">{address.country || 'US'}</p>
                </>
              ) : (
                <>
                  <p className="text-sm">{order.email}</p>
                  <p className="text-sm text-muted-foreground italic">Shipping address not available</p>
                </>
              )}
            </div>
            <div className="border rounded p-4">
              <h3 className="font-semibold text-sm border-b pb-2 mb-2 uppercase tracking-wide">Ship From</h3>
              <p className="font-medium">Dream Tattoo Company</p>
              <p className="text-sm text-muted-foreground">Blue Dream Budder</p>
              <p className="text-sm text-muted-foreground">United States</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-foreground text-background">
                <th className="p-3 text-left text-xs uppercase tracking-wide">Item</th>
                <th className="p-3 text-left text-xs uppercase tracking-wide">Size</th>
                <th className="p-3 text-center text-xs uppercase tracking-wide">Qty</th>
                <th className="p-3 text-center text-xs uppercase tracking-wide">Packed ✓</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">Blue Dream Budder - Premium Aftercare</td>
                <td className="p-3">Standard</td>
                <td className="p-3 text-center">1</td>
                <td className="p-3 text-center">☐</td>
              </tr>
            </tbody>
          </table>

          {/* Shipping Info */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
            <h3 className="font-semibold text-sm mb-2">📦 Shipping Details</h3>
            <p className="text-sm"><strong>Carrier:</strong> {shipment?.carrier || '_________________'}</p>
            <p className="text-sm"><strong>Service:</strong> {shipment?.service_level || '_________________'}</p>
            <p className="text-sm"><strong>Tracking #:</strong> {shipment?.shippo_tracking_number || '_________________'}</p>
          </div>

          {/* Notes Section */}
          <div className="border-2 border-dashed border-muted-foreground/30 p-4 rounded min-h-[80px] mb-6">
            <h3 className="text-xs uppercase text-muted-foreground mb-2">Special Instructions / Notes</h3>
          </div>

          {/* Thank You */}
          <p className="text-center text-lg font-medium mb-6">Thank you for your order! 💜</p>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Questions? Contact us at support@dreamtattoocompany.com</p>
            <p>© {new Date().getFullYear()} Dream Tattoo Company. All rights reserved.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
