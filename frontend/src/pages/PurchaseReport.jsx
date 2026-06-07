import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { DatePicker } from '../components/ui/date-picker';
import { FileSpreadsheet, Download, Search } from 'lucide-react';

export default function PurchaseReport() {
  const [purchases, setPurchases] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [error, setError] = useState('');

  const formatDate = (date) => date ? date.toISOString().split('T')[0] : '';

  const load = () => {
    if (fromDate && toDate && fromDate > toDate) {
      setError('End date cannot be earlier than start date');
      return;
    }
    setError('');
    const params = new URLSearchParams();
    const f = formatDate(fromDate);
    const t = formatDate(toDate);
    if (f) params.set('from', f);
    if (t) params.set('to', t);
    api.get(`/reports/purchases?${params}`).then(r => setPurchases(r.data));
  };

  useEffect(() => { load(); }, []);

  const totalAmount = purchases.reduce((sum, p) => sum + p.total_amount, 0);

  const exportExcel = () => {
    window.open('/api/reports/export/purchases', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Purchase Report</h1>
        </div>
        <Button variant="outline" onClick={exportExcel}><Download className="h-4 w-4 mr-2" />Export Excel</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardContent className="p-6"><p className="text-sm text-gray-500">Total Purchases</p><p className="text-2xl font-bold">{purchases.length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-gray-500">Total Amount</p><p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p></CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">From</label>
          <DatePicker
            date={fromDate}
            onSelect={(d) => { setFromDate(d); if (d && toDate && d > toDate) setToDate(null); }}
            placeholder="Select start date"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">To</label>
          <DatePicker
            date={toDate}
            onSelect={(d) => { setToDate(d); if (fromDate && d && d < fromDate) setError('End date cannot be earlier than start date'); else setError(''); }}
            placeholder="Select end date"
          />
        </div>
        <Button onClick={load}><Search className="h-4 w-4 mr-2" />Filter</Button>
        <Button variant="ghost" onClick={() => { setFromDate(null); setToDate(null); setError(''); }}>Clear</Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.invoice_no}</TableCell>
                  <TableCell>{p.purchase_date}</TableCell>
                  <TableCell>{p.supplier_name || '-'}</TableCell>
                  <TableCell>₹{p.total_amount}</TableCell>
                </TableRow>
              ))}
              {purchases.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-gray-500 py-8">No purchase data</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
