import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { DatePicker } from '../components/ui/date-picker';
import { FileSpreadsheet, Download, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesReport() {
  const [sales, setSales] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [error, setError] = useState('');

  const formatDate = (date) => date ? date.toISOString().split('T')[0] : '';

  const validate = (from, to) => {
    if (from && to && from > to) {
      setError('End date cannot be earlier than start date');
      return false;
    }
    setError('');
    return true;
  };

  const load = () => {
    if (!validate(fromDate, toDate)) return;
    const params = new URLSearchParams();
    const f = formatDate(fromDate);
    const t = formatDate(toDate);
    if (f) params.set('from', f);
    if (t) params.set('to', t);
    api.get(`/reports/sales?${params}`).then(r => setSales(r.data));
  };

  useEffect(() => { load(); }, []);

  const totalAmount = sales.reduce((sum, s) => sum + s.total_amount, 0);

  const chartData = sales.reduce((acc, sale) => {
    const date = sale.sale_date;
    const existing = acc.find(d => d.date === date);
    if (existing) { existing.total += sale.total_amount; existing.count += 1; }
    else acc.push({ date, total: sale.total_amount, count: 1 });
    return acc;
  }, []);

  const exportExcel = () => {
    window.open('/api/reports/export/sales', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Sales Report</h1>
        </div>
        <Button variant="outline" onClick={exportExcel}><Download className="h-4 w-4 mr-2" />Export Excel</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardContent className="p-6"><p className="text-sm text-gray-500">Total Sales</p><p className="text-2xl font-bold">{sales.length}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-gray-500">Total Revenue</p><p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p></CardContent></Card>
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

      {chartData.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

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
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-8">No sales data</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
