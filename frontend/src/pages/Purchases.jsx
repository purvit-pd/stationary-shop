import { useState, useEffect } from 'react';
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
import { Package, Plus, Trash2, Eye } from 'lucide-react';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [books, setBooks] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [form, setForm] = useState({ supplier_id: '', invoice_no: '', purchase_date: new Date(), items: [] });
  const [newItem, setNewItem] = useState({ book_id: '', quantity: 1, unit_cost: 0 });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const load = () => {
    api.get('/purchases').then(r => setPurchases(r.data));
    api.get('/suppliers').then(r => setSuppliers(r.data));
    api.get('/books').then(r => setBooks(r.data));
  };

  useEffect(() => { load(); }, []);

  const addItem = () => {
    if (!newItem.book_id) {
      toast({ title: 'Validation', description: 'Please select a book', variant: 'destructive' });
      return;
    }
    const book = books.find(b => b.id === parseInt(newItem.book_id));
    setForm({
      ...form,
      items: [...form.items, { ...newItem, book_id: parseInt(newItem.book_id), unit_cost: parseFloat(newItem.unit_cost), quantity: parseInt(newItem.quantity), book_title: book?.title }]
    });
    setNewItem({ book_id: '', quantity: 1, unit_cost: 0 });
  };

  const removeItem = (idx) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) {
      toast({ title: 'Validation', description: 'Add at least one item', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/purchases', {
        ...form,
        purchase_date: form.purchase_date ? form.purchase_date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        supplier_id: form.supplier_id ? parseInt(form.supplier_id) : null,
      });
      toast({ title: 'Created', description: 'Purchase recorded successfully', variant: 'success' });
      setOpen(false);
      setForm({ supplier_id: '', invoice_no: '', purchase_date: new Date(), items: [] });
      load();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'Something went wrong', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const viewPurchase = async (id) => {
    const res = await api.get(`/purchases/${id}`);
    setSelectedPurchase(res.data);
    setViewOpen(true);
  };

  const total = form.items.reduce((sum, i) => sum + (i.quantity * i.unit_cost), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Purchase Entry</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Purchase</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>New Purchase</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Invoice No *</Label>
                  <Input value={form.invoice_no} onChange={(e) => setForm({ ...form, invoice_no: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <DatePicker date={form.purchase_date} onSelect={(d) => setForm({ ...form, purchase_date: d || new Date() })} />
                </div>
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}>
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                </div>
              </div>

              <div className="border rounded-lg p-3 sm:p-4 space-y-3">
                <Label className="text-sm font-semibold">Items</Label>
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-sm bg-gray-50 p-2 rounded">
                    <span className="flex-1 min-w-0 truncate text-xs sm:text-sm">{item.book_title}</span>
                    <span className="text-xs sm:text-sm">Qty: {item.quantity}</span>
                    <span className="text-xs sm:text-sm">₹{item.unit_cost}</span>
                    <span className="font-medium text-xs sm:text-sm">₹{item.quantity * item.unit_cost}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}><Trash2 className="h-3 w-3 text-red-500" /></Button>
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Book</Label>
                    <Select value={newItem.book_id} onChange={(e) => {
                      const book = books.find(b => b.id === parseInt(e.target.value));
                      setNewItem({ ...newItem, book_id: e.target.value, unit_cost: book?.cost_price || 0 });
                    }}>
                      <option value="">Select Book</option>
                      {books.map(b => <option key={b.id} value={b.id}>{b.title} (Stock: {b.stock})</option>)}
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20">
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" min="1" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
                    </div>
                    <div className="flex-1 sm:w-24">
                      <Label className="text-xs">Unit Cost</Label>
                      <Input type="number" step="0.01" value={newItem.unit_cost} onChange={(e) => setNewItem({ ...newItem, unit_cost: e.target.value })} />
                    </div>
                    <Button type="button" size="sm" onClick={addItem} className="self-end">Add</Button>
                  </div>
                </div>
              </div>

              <div className="text-right text-lg font-bold">Total: ₹{total.toFixed(2)}</div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={form.items.length === 0 || submitting}>{submitting ? 'Saving...' : 'Save Purchase'}</Button>
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
                <TableHead>Invoice No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.invoice_no}</TableCell>
                  <TableCell>{p.purchase_date}</TableCell>
                  <TableCell>{p.supplier_name || '-'}</TableCell>
                  <TableCell>₹{p.total_amount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => viewPurchase(p.id)}><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {purchases.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-8">No purchases yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Purchase Details</DialogTitle></DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Invoice:</span> <span className="font-medium">{selectedPurchase.invoice_no}</span></div>
                <div><span className="text-gray-500">Date:</span> <span className="font-medium">{selectedPurchase.purchase_date}</span></div>
                <div><span className="text-gray-500">Supplier:</span> <span className="font-medium">{selectedPurchase.supplier_name || 'N/A'}</span></div>
                <div><span className="text-gray-500">Total:</span> <span className="font-medium">₹{selectedPurchase.total_amount}</span></div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPurchase.items?.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.book_title}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₹{item.unit_cost}</TableCell>
                      <TableCell>₹{item.total_cost}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
