import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Plus, Edit2, Trash2, BookOpen, Search } from 'lucide-react';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().optional(),
  publisher: z.string().optional(),
  standard_id: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  cost_price: z.string().optional(),
  stock: z.string().optional(),
  barcode: z.string().optional(),
});

export default function Books() {
  const [books, setBooks] = useState([]);
  const [standards, setStandards] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [standardFilter, setStandardFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: '', author: '', publisher: '', standard_id: '', price: '', cost_price: '', stock: '', barcode: '' },
  });

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (standardFilter) params.set('standard_id', standardFilter);
    api.get(`/books?${params}`).then(r => setBooks(r.data));
  };

  useEffect(() => {
    api.get('/standards').then(r => setStandards(r.data));
    load();
  }, []);

  useEffect(() => { load(); }, [search, standardFilter]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        cost_price: parseFloat(data.cost_price) || 0,
        stock: parseInt(data.stock) || 0,
        standard_id: data.standard_id ? parseInt(data.standard_id) : null,
      };
      if (editing) {
        await api.put(`/books/${editing.id}`, payload);
        toast({ title: 'Updated', description: 'Book updated successfully', variant: 'success' });
      } else {
        await api.post('/books', payload);
        toast({ title: 'Created', description: 'Book created successfully', variant: 'success' });
      }
      setOpen(false);
      setEditing(null);
      reset({ title: '', author: '', publisher: '', standard_id: '', price: '', cost_price: '', stock: '', barcode: '' });
      load();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'Something went wrong', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (b) => {
    setEditing(b);
    reset({
      title: b.title, author: b.author || '', publisher: b.publisher || '',
      standard_id: b.standard_id?.toString() || '', price: b.price.toString(),
      cost_price: b.cost_price.toString(), stock: b.stock.toString(),
      barcode: b.barcode || '',
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/books/${id}`);
      toast({ title: 'Deleted', description: 'Book deleted successfully', variant: 'success' });
      load();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'Cannot delete', variant: 'destructive' });
    }
  };

  const dialogChange = (o) => {
    setOpen(o);
    if (!o) {
      setEditing(null);
      reset({ title: '', author: '', publisher: '', standard_id: '', price: '', cost_price: '', stock: '', barcode: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Books</h1>
        </div>
        <Dialog open={open} onOpenChange={dialogChange}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Book</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? 'Edit Book' : 'Add Book'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Title *</Label>
                  <Input {...register('title')} />
                  {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input {...register('author')} />
                </div>
                <div className="space-y-2">
                  <Label>Publisher</Label>
                  <Input {...register('publisher')} />
                </div>
                <div className="space-y-2">
                  <Label>Standard</Label>
                  <Select {...register('standard_id')}>
                    <option value="">Select Standard</option>
                    {standards.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Barcode</Label>
                  <Input {...register('barcode')} />
                </div>
                <div className="space-y-2">
                  <Label>Price (₹) *</Label>
                  <Input type="number" step="0.01" {...register('price')} />
                  {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Cost Price</Label>
                  <Input type="number" step="0.01" {...register('cost_price')} />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input type="number" {...register('stock')} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => dialogChange(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search by title, author, barcode..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={standardFilter} onChange={(e) => setStandardFilter(e.target.value)} className="w-48">
          <option value="">All Standards</option>
          {standards.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Standard</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell className="text-gray-500">{b.author || '-'}</TableCell>
                  <TableCell><Badge variant="secondary">{b.standard_name || 'N/A'}</Badge></TableCell>
                  <TableCell>₹{b.price}</TableCell>
                  <TableCell>
                    <Badge variant={b.stock <= 5 ? 'destructive' : 'success'}>{b.stock}</Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{b.barcode || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(b)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {books.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">No books found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
