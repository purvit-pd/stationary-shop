import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { DatePicker } from '../components/ui/date-picker';
import { Card, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ShoppingCart, Plus, Trash2, Eye, Printer, BookUp } from 'lucide-react';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [books, setBooks] = useState([]);
  const [standards, setStandards] = useState([]);
  const [open, setOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const invoiceRef = useRef();
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', sale_date: new Date(),
    discount: 0, payment_method: 'cash', items: []
  });
  const [newItem, setNewItem] = useState({ book_id: '', quantity: 1, unit_price: 0 });
  const [selectedStandard, setSelectedStandard] = useState('');
  const { toast } = useToast();

  const load = () => {
    api.get('/sales').then(r => setSales(r.data));
    api.get('/books').then(r => setBooks(r.data));
    api.get('/standards').then(r => setStandards(r.data));
  };

  useEffect(() => { load(); }, []);

  const selectBook = (id) => {
    const book = books.find(b => b.id === parseInt(id));
    if (book) setNewItem({ ...newItem, book_id: id, unit_price: book.price });
  };

  const addItem = () => {
    if (!newItem.book_id || !newItem.quantity) {
      toast({ title: 'Validation', description: 'Please select a book and enter quantity', variant: 'destructive' });
      return;
    }
    const book = books.find(b => b.id === parseInt(newItem.book_id));
    if (book && book.stock < parseInt(newItem.quantity)) {
      toast({ title: 'Insufficient Stock', description: `Only ${book.stock} available for ${book.title}`, variant: 'destructive' });
      return;
    }
    setForm({
      ...form,
      items: [...form.items, { ...newItem, book_id: parseInt(newItem.book_id), unit_price: parseFloat(newItem.unit_price), quantity: parseInt(newItem.quantity), book_title: book?.title }]
    });
    setNewItem({ book_id: '', quantity: 1, unit_price: 0 });
  };

  const removeItem = (idx) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const updateItemQty = (idx, qty) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], quantity: Math.max(1, parseInt(qty) || 1) };
    setForm({ ...form, items });
  };

  const addStandardBooks = (standardId) => {
    if (!standardId) return;
    const standardBooks = books.filter(b => b.standard_id === parseInt(standardId));
    if (standardBooks.length === 0) {
      toast({ title: 'No Books', description: 'No books found for this standard', variant: 'destructive' });
      return;
    }
    const newItems = standardBooks.map(b => ({
      book_id: b.id,
      quantity: 1,
      unit_price: b.price,
      book_title: b.title,
    }));
    setForm({ ...form, items: newItems });
    toast({ title: 'Books Added', description: `${newItems.length} books added for standard`, variant: 'success' });
  };

  const subtotal = form.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
  const discountAmt = parseFloat(form.discount) || 0;
  const grandTotal = Math.max(0, subtotal - discountAmt);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) {
      toast({ title: 'Validation', description: 'Add at least one item', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/sales', {
        ...form,
        sale_date: form.sale_date ? form.sale_date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        discount: discountAmt,
      });
      toast({ title: 'Sale Completed', description: 'Invoice created successfully', variant: 'success' });
      setOpen(false);
      setForm({ customer_name: '', customer_phone: '', sale_date: new Date(), discount: 0, payment_method: 'cash', items: [] });
      setSelectedStandard('');
      load();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'Sale failed', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const viewInvoice = async (id) => {
    const res = await api.get(`/sales/${id}`);
    setSelectedSale(res.data);
    setInvoiceOpen(true);
  };

  const printInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !selectedSale) return;
    const itemsHtml = selectedSale.items.map(i => `
      <tr><td>${i.book_title}</td><td>${i.quantity}</td><td>₹${i.unit_price}</td><td>₹${i.total_price}</td></tr>
    `).join('');
    printWindow.document.write(`
      <html><head><title>Invoice ${selectedSale.invoice_no}</title>
      <style>body{font-family:monospace;padding:20px;max-width:80mm;margin:auto}
      table{width:100%;border-collapse:collapse}th,td{border:1px solid #000;padding:4px;text-align:left;font-size:12px}
      h1,h2{text-align:center}.right{text-align:right}.bold{font-weight:bold}
      @media print{body{width:80mm;padding:5px}}
      </style></head><body>
      <h1>Stationery Shop</h1>
      <p>Invoice: ${selectedSale.invoice_no}</p>
      <p>Date: ${selectedSale.sale_date}</p>
      <p>Customer: ${selectedSale.customer_name || 'Walk-in'}</p>
      <hr/>
      <table><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr>${itemsHtml}</table>
      <hr/>
      <p class="right bold">Subtotal: ₹${selectedSale.total_amount + selectedSale.discount}</p>
      <p class="right bold">Discount: ₹${selectedSale.discount}</p>
      <p class="right bold">Total: ₹${selectedSale.total_amount}</p>
      <p class="right">Payment: ${selectedSale.payment_method}</p>
      <hr/><p style="text-align:center">Thank you!</p>
      <script>window.print();window.close();</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Sale</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>New Sale / Billing</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <DatePicker date={form.sale_date} onSelect={(d) => setForm({ ...form, sale_date: d || new Date() })} />
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-semibold whitespace-nowrap">Select Standard</Label>
                  <Select value={selectedStandard} onChange={(e) => { setSelectedStandard(e.target.value); addStandardBooks(e.target.value); }}>
                    <option value="">All Books (Manual)</option>
                    {standards.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                </div>

                <Label className="text-sm font-semibold">Items</Label>
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                    <span className="flex-1 truncate">{item.book_title}</span>
                    <div className="w-16">
                      <Input type="number" min="1" className="h-7 text-xs" value={item.quantity} onChange={(e) => updateItemQty(idx, e.target.value)} />
                    </div>
                    <span className="w-16 text-right">₹{item.unit_price}</span>
                    <span className="w-20 text-right font-medium">₹{(item.quantity * item.unit_price).toFixed(0)}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}><Trash2 className="h-3 w-3 text-red-500" /></Button>
                  </div>
                ))}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Book (Barcode/Name)</Label>
                    <Select value={newItem.book_id} onChange={(e) => selectBook(e.target.value)}>
                      <option value="">Select Book</option>
                      {books.map(b => <option key={b.id} value={b.id}>{b.title} {b.barcode ? `(${b.barcode})` : ''} - Stock: {b.stock}</option>)}
                    </Select>
                  </div>
                  <div className="w-20">
                    <Label className="text-xs">Qty</Label>
                    <Input type="number" min="1" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">Price</Label>
                    <Input type="number" step="0.01" value={newItem.unit_price} onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })} />
                  </div>
                  <Button type="button" size="sm" onClick={addItem}>Add</Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <Label>Discount (₹)</Label>
                  <Input type="number" className="w-32" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Payment</Label>
                  <Select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="credit">Credit</option>
                  </Select>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm text-gray-500">Subtotal: ₹{subtotal.toFixed(2)}</p>
                  <p className="text-lg font-bold">Total: ₹{grandTotal.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={form.items.length === 0 || submitting}>{submitting ? 'Saving...' : 'Save & Print'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.invoice_no}</TableCell>
                  <TableCell>{s.sale_date}</TableCell>
                  <TableCell>{s.customer_name || 'Walk-in'}</TableCell>
                  <TableCell>₹{s.total_amount}</TableCell>
                  <TableCell className="capitalize">{s.payment_method}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => viewInvoice(s.id)}><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No sales yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Invoice Details</span>
              <Button variant="outline" size="sm" onClick={printInvoice}><Printer className="h-4 w-4 mr-2" />Print</Button>
            </DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div ref={invoiceRef} className="space-y-4">
              <div className="text-center border-b pb-3">
                <h2 className="text-lg font-bold">Stationery Shop</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Invoice:</span> <span className="font-medium">{selectedSale.invoice_no}</span></div>
                <div><span className="text-gray-500">Date:</span> <span className="font-medium">{selectedSale.sale_date}</span></div>
                <div><span className="text-gray-500">Customer:</span> <span className="font-medium">{selectedSale.customer_name || 'Walk-in'}</span></div>
                <div><span className="text-gray-500">Payment:</span> <span className="font-medium capitalize">{selectedSale.payment_method}</span></div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSale.items?.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.book_title}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₹{item.unit_price}</TableCell>
                      <TableCell>₹{item.total_price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-right space-y-1 text-sm">
                <p>Subtotal: ₹{(selectedSale.total_amount + selectedSale.discount).toFixed(2)}</p>
                {selectedSale.discount > 0 && <p>Discount: -₹{selectedSale.discount}</p>}
                <p className="text-lg font-bold">Total: ₹{selectedSale.total_amount}</p>
              </div>
              <div className="text-center text-xs text-gray-500 border-t pt-3">Thank you for your purchase!</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
