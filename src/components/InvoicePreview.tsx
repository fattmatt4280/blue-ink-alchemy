import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export const InvoicePreview = () => {
  const [open, setOpen] = useState(false);

  // Mock data for preview
  const mockData = {
    invoiceNumber: 'INV-PREVIEW123',
    invoiceDate: new Date().toLocaleDateString(),
    status: 'PAID',
    email: 'customer@example.com',
    shipping_info: {
      name: 'John Doe',
      street1: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      country: 'US'
    },
    product: {
      name: 'Blue Dream Budder - Premium Quality',
      description: 'High-quality healing product for optimal recovery'
    },
    subtotal: 49.99,
    shipping: 10.00,
    tracking: {
      number: 'TRACK123456789',
      carrier: 'USPS',
      status: 'In Transit'
    }
  };

  const total = mockData.subtotal + mockData.shipping;

  const invoiceHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; position: relative; }
        .invoice-container { position: relative; min-height: 100%; }
        .watermark { 
          position: absolute; 
          top: 50%; 
          left: 50%; 
          transform: translate(-50%, -50%); 
          opacity: 0.08; 
          width: 350px; 
          pointer-events: none; 
          z-index: 0; 
        }
        .content { position: relative; z-index: 1; }
        .header { display: flex; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .header-logo { width: 80px; height: auto; margin-right: 20px; }
        .header-info { flex: 1; }
        .header-info h1 { margin: 0 0 5px 0; font-size: 24px; color: #333; }
        .header-info p { margin: 2px 0; font-size: 12px; color: #666; }
        .invoice-title { text-align: center; margin: 30px 0; }
        .invoice-title h2 { font-size: 28px; color: #333; letter-spacing: 2px; margin: 0; }
        .invoice-details { margin-bottom: 30px; background: #f9f9f9; padding: 15px; border-radius: 5px; }
        .billing-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .billing-info > div { width: 48%; }
        .billing-info h3 { margin: 0 0 10px 0; font-size: 14px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .billing-info p { margin: 5px 0; font-size: 13px; color: #555; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .items-table th { background-color: #333; color: white; font-size: 12px; text-transform: uppercase; }
        .items-table td { font-size: 13px; }
        .totals { text-align: right; margin-bottom: 30px; }
        .totals p { margin: 5px 0; font-size: 14px; }
        .totals .total-line { font-size: 18px; color: #333; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
        .tracking-info { background-color: #f0f7ff; padding: 15px; margin-bottom: 20px; border-radius: 5px; border-left: 4px solid #667eea; }
        .tracking-info h3 { margin: 0 0 10px 0; color: #333; font-size: 14px; }
        .tracking-info p { margin: 5px 0; font-size: 13px; color: #555; }
        .disclaimer { background-color: #fafafa; padding: 20px; margin-top: 30px; border: 1px solid #eee; font-size: 11px; color: #666; }
        .disclaimer h3 { font-size: 14px; color: #333; margin: 0 0 15px 0; text-align: center; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        .disclaimer h4 { font-size: 11px; color: #444; margin: 15px 0 5px 0; text-transform: uppercase; }
        .disclaimer p { margin: 5px 0 10px 0; line-height: 1.5; }
        .disclaimer a { color: #667eea; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
        .footer p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <img src="/images/invoice-logo-watermark.jpeg" alt="" class="watermark" />
        
        <div class="content">
          <div class="header">
            <img src="/images/invoice-logo-bw.jpeg" alt="Dream Tattoo Company" class="header-logo" />
            <div class="header-info">
              <h1>Dream Tattoo Company</h1>
              <p>Blue Dream Budder Premium Aftercare</p>
              <p>Email: support@dreamtattoocompany.com</p>
              <p>Website: www.bluedreambudder.com</p>
            </div>
          </div>
          
          <div class="invoice-title">
            <h2>INVOICE</h2>
          </div>
          
          <div class="invoice-details">
            <strong>Invoice #:</strong> ${mockData.invoiceNumber} &nbsp;&nbsp;|&nbsp;&nbsp;
            <strong>Date:</strong> ${mockData.invoiceDate} &nbsp;&nbsp;|&nbsp;&nbsp;
            <strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">${mockData.status}</span>
          </div>

          <div class="billing-info">
            <div>
              <h3>Bill To:</h3>
              <p><strong>${mockData.shipping_info.name}</strong></p>
              <p>${mockData.email}</p>
              <p>${mockData.shipping_info.street1}</p>
              <p>${mockData.shipping_info.city}, ${mockData.shipping_info.state} ${mockData.shipping_info.zip}</p>
              <p>${mockData.shipping_info.country}</p>
            </div>
            <div>
              <h3>Ship To:</h3>
              <p><strong>${mockData.shipping_info.name}</strong></p>
              <p>${mockData.shipping_info.street1}</p>
              <p>${mockData.shipping_info.city}, ${mockData.shipping_info.state} ${mockData.shipping_info.zip}</p>
              <p>${mockData.shipping_info.country}</p>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${mockData.product.name}</td>
                <td>${mockData.product.description}</td>
                <td>1</td>
                <td>$${mockData.subtotal.toFixed(2)}</td>
                <td>$${mockData.subtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <p><strong>Subtotal:</strong> $${mockData.subtotal.toFixed(2)}</p>
            <p><strong>Shipping:</strong> $${mockData.shipping.toFixed(2)}</p>
            <p class="total-line"><strong>Total:</strong> $${total.toFixed(2)}</p>
          </div>

          <div class="tracking-info">
            <h3>📦 Tracking Information</h3>
            <p><strong>Tracking Number:</strong> ${mockData.tracking.number}</p>
            <p><strong>Carrier:</strong> ${mockData.tracking.carrier}</p>
            <p><strong>Status:</strong> ${mockData.tracking.status}</p>
          </div>

          <div class="disclaimer">
            <h3>Important Information</h3>
            
            <h4>Return Policy</h4>
            <p>For returns, exchanges, or any order-related inquiries, please contact us at: <a href="mailto:support@dreamtattoocompany.com">support@dreamtattoocompany.com</a></p>
            
            <h4>Medical Disclaimer</h4>
            <p>This product is not intended to diagnose, treat, cure, or prevent any disease. The statements made regarding this product have not been evaluated by the Food and Drug Administration. Always consult with a qualified healthcare professional before using any new skincare or aftercare product, especially if you have pre-existing medical conditions or are taking medications.</p>
            
            <h4>Allergy Warning</h4>
            <p>Please review all ingredients before use. If you have known allergies or sensitivities, perform a patch test on a small area of skin before full application. If you experience any adverse reactions including but not limited to redness, itching, swelling, or irritation, discontinue use immediately and consult a physician.</p>
            
            <h4>Limitation of Liability</h4>
            <p>Dream Tattoo Company and Blue Dream Budder are not responsible for any adverse reactions, damages, or injuries resulting from product use or misuse. By purchasing and using this product, you acknowledge that you have read and understood these terms and agree to use the product at your own risk and in accordance with provided instructions.</p>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>© ${new Date().getFullYear()} Dream Tattoo Company. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Invoice Template Preview
        </CardTitle>
        <CardDescription>
          View what your customers see when they receive an invoice email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <FileText className="mr-2 h-4 w-4" />
              Preview Invoice Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Invoice Template Preview</DialogTitle>
              <DialogDescription>
                This is what customers see in their invoice emails (using sample data)
              </DialogDescription>
            </DialogHeader>
            <div 
              className="border rounded-lg p-4 bg-white"
              dangerouslySetInnerHTML={{ __html: invoiceHtml }}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
