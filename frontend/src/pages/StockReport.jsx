import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { BarChart3, Search, Download, AlertTriangle } from 'lucide-react';

export default function StockReport() {
  const [books, setBooks] = useState([]);
  const [standards, setStandards] = useState([]);
  const [search, setSearch] = useState('');
  const [standardFilter, setStandardFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const load = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (standardFilter) params.set('standard_id', standardFilter);
    if (lowStockOnly) params.set('stock_low', 'true');
    api.get(`/reports/stock?${params}`).then(r => setBooks(r.data));
  };

  useEffect(() => {
    api.get('/standards').then(r => setStandards(r.data));
    load();
  }, []);

  useEffect(() => { load(); }, [search, standardFilter, lowStockOnly]);

  const exportExcel = () => {
    window.open('/api/reports/export/stock', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Stock Report</h1>
        </div>
        <Button variant="outline" onClick={exportExcel}><Download className="h-4 w-4 mr-2" />Export Excel</Button>
      </div>

      <div className="flex gap-4 flex-wrap items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search books..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={standardFilter} onChange={(e) => setStandardFilter(e.target.value)} className="w-48">
          <option value="">All Standards</option>
          {standards.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} className="rounded" />
          <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-red-500" /> Low Stock Only</span>
        </label>
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
                <TableHead>Cost Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Barcode</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell className="text-gray-500">{b.author || '-'}</TableCell>
                  <TableCell><Badge variant="secondary">{b.standard_name || 'N/A'}</Badge></TableCell>
                  <TableCell>₹{b.price}</TableCell>
                  <TableCell>₹{b.cost_price}</TableCell>
                  <TableCell>
                    <Badge variant={b.stock <= 5 ? 'destructive' : 'success'}>{b.stock}</Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{b.barcode || '-'}</TableCell>
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
