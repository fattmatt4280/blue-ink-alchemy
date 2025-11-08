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
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; }
        .header { text-align: center; margin-bottom: 30px; }
        .invoice-details { margin-bottom: 30px; }
        .billing-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .items-table th { background-color: #f2f2f2; }
        .totals { text-align: right; margin-bottom: 30px; }
        .footer { text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="color: #667eea; font-size: 32px;">INVOICE</h1>
        <h2 style="color: #333; margin: 10px 0;">Blue Dream Budder</h2>
      </div>
      
      <div class="invoice-details">
        <strong>Invoice #:</strong> ${mockData.invoiceNumber}<br>
        <strong>Date:</strong> ${mockData.invoiceDate}<br>
        <strong>Status:</strong> ${mockData.status}
      </div>

      <div class="billing-info">
        <div>
          <h3>Bill To:</h3>
          <p>${mockData.email}</p>
          <p>
            ${mockData.shipping_info.name}<br>
            ${mockData.shipping_info.street1}<br>
            ${mockData.shipping_info.city}, ${mockData.shipping_info.state} ${mockData.shipping_info.zip}<br>
            ${mockData.shipping_info.country}
          </p>
        </div>
        <div>
          <h3>Ship To:</h3>
          <p>
            ${mockData.shipping_info.name}<br>
            ${mockData.shipping_info.street1}<br>
            ${mockData.shipping_info.city}, ${mockData.shipping_info.state} ${mockData.shipping_info.zip}<br>
            ${mockData.shipping_info.country}
          </p>
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
        <p><strong>Subtotal: $${mockData.subtotal.toFixed(2)}</strong></p>
        <p><strong>Shipping: $${mockData.shipping.toFixed(2)}</strong></p>
        <p style="font-size: 18px;"><strong>Total: $${total.toFixed(2)}</strong></p>
      </div>

      <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 20px;">
        <h3>Tracking Information</h3>
        <p><strong>Tracking Number:</strong> ${mockData.tracking.number}</p>
        <p><strong>Carrier:</strong> ${mockData.tracking.carrier}</p>
        <p><strong>Status:</strong> ${mockData.tracking.status}</p>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>If you have any questions about this invoice, please contact us.</p>
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
