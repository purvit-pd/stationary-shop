import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../lib/api';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Edit2, Trash2, BookUp } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export default function Standards() {
  const [standards, setStandards] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  const load = () => api.get('/standards').then(r => setStandards(r.data));
  useEffect(() => { load(); }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/standards/${editing.id}`, data);
        toast({ title: 'Updated', description: 'Standard updated successfully', variant: 'success' });
      } else {
        await api.post('/standards', data);
        toast({ title: 'Created', description: 'Standard created successfully', variant: 'success' });
      }
      setOpen(false);
      setEditing(null);
      reset({ name: '', description: '' });
      load();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'Something went wrong', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (s) => {
    setEditing(s);
    reset({ name: s.name, description: s.description || '' });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/standards/${id}`);
      toast({ title: 'Deleted', description: 'Standard deleted successfully', variant: 'success' });
      load();
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'Cannot delete', variant: 'destructive' });
    }
  };

  const dialogChange = (o) => {
    setOpen(o);
    if (!o) {
      setEditing(null);
      reset({ name: '', description: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookUp className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Standards</h1>
        </div>
        <Dialog open={open} onOpenChange={dialogChange}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Standard</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Standard' : 'Add Standard'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input {...register('name')} />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea {...register('description')} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => dialogChange(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
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
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standards.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-gray-500">{s.description || '-'}</TableCell>
                  <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {standards.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-8">No standards yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
