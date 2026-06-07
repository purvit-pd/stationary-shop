import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { DatePicker } from '../components/ui/date-picker';
import { Card, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { ArrowLeftRight, Plus, Trash2, Eye } from 'lucide-react';

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [books, setBooks] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [form, setForm] = useState({ type: 'sale', reference_id: '', return_date: new Date(), reason: '', items: [] });
  const [newItem, setNewItem] = useState({ book_id: '', quantity: 1, unit_price: 0 });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const load = () => {
    api.get('/returns').then(r => setReturns(r.data));
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
      items: [...form.items, { ...newItem, book_id: parseInt(newItem.book_id), unit_price: parseFloat(newItem.unit_price), quantity: parseInt(newItem.quantity), book_title: book?.title }]
    });
    setNewItem({ book_id: '', quantity: 1, unit_price: 0 });
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
      await api.post('/returns', {
        ...form,
        return_date: form.return_date ? form.return_date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        reference_id: parseInt(form.reference_id),
      });
      toast({ title: 'Created', description: 'Return recorded successfully', variant: 'success' });
      setOpen(false);
      setForm({ type: 'sale', reference_id: '', return_date: new Date(), reason: '', items: [] });
      load();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'Something went wrong', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const viewReturn = async (id) => {
    const res = await api.get(`/returns/${id}`);
    setSelectedReturn(res.data);
    setViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Returns</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />New Return</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>New Return</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="sale">Sale Return</option>
                    <option value="purchase">Purchase Return</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reference ID *</Label>
                  <Input type="number" value={form.reference_id} onChange={(e) => setForm({ ...form, reference_id: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <DatePicker date={form.return_date} onSelect={(d) => setForm({ ...form, return_date: d || new Date() })} />
                </div>
              </div>

              <div className="border rounded-lg p-3 sm:p-4 space-y-3">
                <Label className="text-sm font-semibold">Items</Label>
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-sm bg-gray-50 p-2 rounded">
                    <span className="flex-1 min-w-0 truncate text-xs sm:text-sm">{item.book_title}</span>
                    <span className="text-xs sm:text-sm">Qty: {item.quantity}</span>
                    <span className="text-xs sm:text-sm">₹{item.unit_price}</span>
                    <span className="font-medium text-xs sm:text-sm">₹{item.quantity * item.unit_price}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}><Trash2 className="h-3 w-3 text-red-500" /></Button>
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Book</Label>
                    <Select value={newItem.book_id} onChange={(e) => setNewItem({ ...newItem, book_id: e.target.value })}>
                      <option value="">Select Book</option>
                      {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20">
                      <Label className="text-xs">Qty</Label>
                      <Input type="number" min="1" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
                    </div>
                    <div className="flex-1 sm:w-24">
                      <Label className="text-xs">Unit Price</Label>
                      <Input type="number" step="0.01" value={newItem.unit_price} onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })} />
                    </div>
                    <Button type="button" size="sm" onClick={addItem} className="self-end">Add</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={form.items.length === 0 || submitting}>{submitting ? 'Saving...' : 'Save Return'}</Button>
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
                <TableHead>Type</TableHead>
                <TableHead>Reference ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.map((r) => (
                <TableRow key={r.id}>
                  <TableCell><Badge variant={r.type === 'sale' ? 'success' : 'warning'} className="capitalize">{r.type} Return</Badge></TableCell>
                  <TableCell>#{r.reference_id}</TableCell>
                  <TableCell>{r.return_date}</TableCell>
                  <TableCell>₹{r.total_amount}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{r.reason || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => viewReturn(r.id)}><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {returns.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No returns yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Return Details</DialogTitle></DialogHeader>
          {selectedReturn && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Type:</span> <Badge variant={selectedReturn.type === 'sale' ? 'success' : 'warning'} className="capitalize">{selectedReturn.type}</Badge></div>
                <div><span className="text-gray-500">Reference:</span> #{selectedReturn.reference_id}</div>
                <div><span className="text-gray-500">Date:</span> {selectedReturn.return_date}</div>
                <div><span className="text-gray-500">Total:</span> ₹{selectedReturn.total_amount}</div>
              </div>
              {selectedReturn.reason && <p className="text-sm"><span className="text-gray-500">Reason:</span> {selectedReturn.reason}</p>}
              <Table>
                <TableHeader><TableRow><TableHead>Book</TableHead><TableHead>Qty</TableHead><TableHead>Price</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {selectedReturn.items?.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{item.book_title}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₹{item.unit_price}</TableCell>
                      <TableCell>₹{item.total_price}</TableCell>
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
