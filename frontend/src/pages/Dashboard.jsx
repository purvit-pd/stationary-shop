import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { BookOpen, Users, Package, AlertTriangle, IndianRupee, TrendingUp, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topBooks, setTopBooks] = useState([]);

  useEffect(() => {
    api.get('/dashboard/summary').then(r => setData(r.data)).catch(() => {});
    api.get('/dashboard/sales-chart?days=7').then(r => setChartData(r.data)).catch(() => {});
    api.get('/dashboard/top-books').then(r => setTopBooks(r.data)).catch(() => {});
  }, []);

  if (!data) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading dashboard...</p></div>;

  const stats = [
    { label: 'Total Books', value: data.totalBooks, icon: BookOpen, color: 'bg-primary', link: '/books' },
    { label: 'Total Stock', value: data.totalStock, icon: Package, color: 'bg-primary', link: '/books' },
    { label: 'Suppliers', value: data.totalSuppliers, icon: Users, color: 'bg-primary', link: '/suppliers' },
    { label: 'Low Stock Items', value: data.lowStock, icon: AlertTriangle, color: 'bg-primary', link: '/reports/stock' },
    { label: "Today's Sales", value: `₹${data.todaySales.toLocaleString()}`, icon: IndianRupee, color: 'bg-primary' },
    { label: 'Total Sales', value: `₹${data.totalSales.toLocaleString()}`, icon: TrendingUp, color: 'bg-primary' },
    { label: 'Total Purchases', value: `₹${data.totalPurchases.toLocaleString()}`, icon: ArrowUpRight, color: 'bg-primary' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.link || '#'} className={!s.link ? 'pointer-events-none' : ''}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className="text-2xl font-bold mt-1">{s.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${s.color}`}>
                    <s.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Sales (Last 7 Days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Top Selling Books</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topBooks.map((book, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{book.title}</p>
                    <p className="text-xs text-gray-500">Sold: {book.total_sold} units</p>
                  </div>
                  <p className="text-sm font-medium">₹{book.total_revenue}</p>
                </div>
              ))}
              {topBooks.length === 0 && <p className="text-sm text-gray-500">No sales data yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Sales</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{sale.invoice_no}</p>
                    <p className="text-xs text-gray-500">{sale.customer_name || 'Walk-in'} | {sale.sale_date}</p>
                  </div>
                  <p className="text-sm font-medium">₹{sale.total_amount}</p>
                </div>
              ))}
              {data.recentSales.length === 0 && <p className="text-sm text-gray-500">No recent sales</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Low Stock Alerts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.lowStockBooks.map((book) => (
                <div key={book.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{book.title}</p>
                    <p className="text-xs text-gray-500">{book.standard_name || 'N/A'} | Stock: {book.stock}</p>
                  </div>
                  <Badge variant={book.stock === 0 ? 'destructive' : 'warning'}>{book.stock}</Badge>
                </div>
              ))}
              {data.lowStockBooks.length === 0 && <p className="text-sm text-gray-500">All books well stocked</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
