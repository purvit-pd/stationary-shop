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
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.link || '#'} className={!s.link ? 'pointer-events-none' : ''}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="text-xs md:text-sm text-gray-500 truncate">{s.label}</p>
                    <p className="text-lg md:text-2xl font-bold mt-1 truncate">{s.value}</p>
                  </div>
                  <div className={`p-2 md:p-3 rounded-lg shrink-0 ${s.color}`}>
                    <s.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader className="px-4 md:px-6 pt-4 md:pt-6"><CardTitle className="text-base md:text-lg">Sales (Last 7 Days)</CardTitle></CardHeader>
          <CardContent className="px-2 md:px-6">
            <div className="h-60 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 md:px-6 pt-4 md:pt-6"><CardTitle className="text-base md:text-lg">Top Selling Books</CardTitle></CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="space-y-1 md:space-y-3">
              {topBooks.map((book, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-xs md:text-sm font-medium truncate">{book.title}</p>
                    <p className="text-xs text-gray-500">Sold: {book.total_sold} units</p>
                  </div>
                  <p className="text-xs md:text-sm font-medium shrink-0">₹{book.total_revenue}</p>
                </div>
              ))}
              {topBooks.length === 0 && <p className="text-sm text-gray-500">No sales data yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader className="px-4 md:px-6 pt-4 md:pt-6"><CardTitle className="text-base md:text-lg">Recent Sales</CardTitle></CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="space-y-1 md:space-y-3">
              {data.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="min-w-0 mr-2">
                    <p className="text-xs md:text-sm font-medium truncate">{sale.invoice_no}</p>
                    <p className="text-xs text-gray-500 truncate">{sale.customer_name || 'Walk-in'} | {sale.sale_date}</p>
                  </div>
                  <p className="text-xs md:text-sm font-medium shrink-0">₹{sale.total_amount}</p>
                </div>
              ))}
              {data.recentSales.length === 0 && <p className="text-sm text-gray-500">No recent sales</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 md:px-6 pt-4 md:pt-6"><CardTitle className="text-base md:text-lg">Low Stock Alerts</CardTitle></CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="space-y-1 md:space-y-3">
              {data.lowStockBooks.map((book) => (
                <div key={book.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-xs md:text-sm font-medium truncate">{book.title}</p>
                    <p className="text-xs text-gray-500 truncate">{book.standard_name || 'N/A'} | Stock: {book.stock}</p>
                  </div>
                  <Badge variant={book.stock === 0 ? 'destructive' : 'warning'} className="shrink-0 text-xs">{book.stock}</Badge>
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
