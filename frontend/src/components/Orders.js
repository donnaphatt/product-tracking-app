import React, { useEffect, useState } from 'react';
import { getProducts, getOrders, createOrder, updateOrderStatus, getLiveEvents } from '../api';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, TextField, Select, MenuItem, IconButton, Box, Tooltip } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const defaultProductRow = { product_id: '', quantity: 1, touched: false };

const Orders = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productRows, setProductRows] = useState([{ ...defaultProductRow }]);
  const [salesChannel, setSalesChannel] = useState('Shopee');
  const [shopeeFee, setShopeeFee] = useState(0);
  const [sellerCoupon, setSellerCoupon] = useState(0);
  const [adsFee, setAdsFee] = useState(0); // legacy, will remove
  const [liveEvents, setLiveEvents] = useState([]);
  const salesChannels = [
    { label: 'Shopee', value: 'Shopee' },
    { label: 'Live-Selling', value: 'Live-Selling' }
  ];
  const [selectedEventId, setSelectedEventId] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [soldDate, setSoldDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  useEffect(() => {
    getProducts().then(setProducts);
    getOrders().then(setOrders);
    getLiveEvents().then(setLiveEvents);
  }, []);

  const handleProductChange = (idx, field, value) => {
    const rows = [...productRows];
    if (field === 'product_id') {
      rows[idx][field] = String(value);
      rows[idx].touched = true;
    } else {
      rows[idx][field] = value;
    }
    setProductRows(rows);
  };


  const handleProductBlur = (idx) => {
    const rows = [...productRows];
    rows[idx].touched = true;
    setProductRows(rows);
  };


  const addProductRow = () => setProductRows([...productRows, { product_id: '', quantity: 1, touched: false }]);
  const removeProductRow = (idx) => setProductRows(productRows.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Remove empty/incomplete rows
    const validRows = productRows.filter(row => row.product_id && Number(row.quantity) > 0);
    if (validRows.length === 0) {
      setMessage('Please add at least one product with quantity > 0.');
      return;
    }
    // Check for duplicate products
    const ids = validRows.map(row => row.product_id);
    const hasDuplicate = ids.length !== new Set(ids).size;
    if (hasDuplicate) {
      setMessage('Each product can only be added once per order.');
      return;
    }
    const isLiveSell = salesChannel && salesChannel.toLowerCase().includes('live');
    try {
      await createOrder({
        products: validRows,
        sales_channel: salesChannel,
        shopee_fee: isLiveSell ? 0 : Number(shopeeFee),
        seller_coupon: isLiveSell ? 0 : Number(sellerCoupon),
        shipping_fee: Number(shippingFee),
        revenue: Number(revenue),
        sold_date: soldDate,
        status: status,
        live_selling_event_id: isLiveSell ? selectedEventId : null,
      });
      setMessage('Order created successfully!');
      setProductRows([{ ...defaultProductRow }]);
      setShopeeFee(0); setAdsFee(0); setShippingFee(0); setRevenue(0); setStatus('pending');
      setSoldDate(() => {
        const today = new Date();
        return today.toISOString().slice(0, 10);
      });
      getOrders().then(setOrders);
      getProducts().then(setProducts); // Fetch latest products after order
    } catch {
      setMessage('Failed to create order.');
    }
  };

  return (
    <Box sx={{ width: "100%", mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Orders</Typography>
      <form onSubmit={handleSubmit}>
        <Typography variant="h6">Create New Order</Typography>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <TextField
            label="Sold Date"
            type="date"
            value={soldDate}
            onChange={e => setSoldDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
        </Box>
        {productRows.map((row, idx) => (
          <Box key={idx} display="flex" alignItems="center" gap={2} mb={1}>
            
            <Select
              value={String(row.product_id)}
              onChange={e => handleProductChange(idx, 'product_id', e.target.value)}
              onBlur={() => handleProductBlur(idx)}
              displayEmpty
              error={!row.product_id && row.touched}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value=""><em>Select Product</em></MenuItem>
              {products.filter(p => p.remaining_quantity > 0).map(p => (
                <MenuItem key={p.product_id} value={String(p.product_id)} disabled={productRows.some((row, i) => String(row.product_id) === String(p.product_id) && i !== idx)}>
                  {p.name} (Remain: {p.remaining_quantity})
                </MenuItem>
              ))}
            </Select>
            <TextField
              type="number"
              label="Quantity"
              value={row.quantity}
              onChange={e => handleProductChange(idx, 'quantity', Number(e.target.value))}
              inputProps={{ min: 1 }}
              sx={{ width: 100 }}
              required
            />
            <IconButton onClick={addProductRow} color="success" size="small"><AddCircleIcon /></IconButton>
            {productRows.length > 1 && (
              <IconButton onClick={() => removeProductRow(idx)} color="error" size="small"><RemoveCircleIcon /></IconButton>
            )}
          </Box>
        ))}
        <Box display="flex" gap={2} mb={2}>
          <Select
            label="Sales Channel"
            value={salesChannel}
            onChange={e => {
              setSalesChannel(e.target.value);
              if (e.target.value.toLowerCase().includes('live')) {
                setShopeeFee(0);
                setSellerCoupon(0);
              }
            }}
            required
            sx={{ minWidth: 180 }}
          >
            {salesChannels.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
          
          {!(salesChannel && salesChannel.toLowerCase().includes('live')) && (
            <>
              <TextField type="number" label="Shopee Fee" value={shopeeFee} onChange={e => setShopeeFee(e.target.value)} sx={{ minWidth: 120 }} />
              <TextField label="Seller Coupon/Discount" type="number" value={sellerCoupon} onChange={e => setSellerCoupon(e.target.value)} sx={{ minWidth: 180 }} />
            </>
          )}
          {/* Ads Fee removed from manual input */}
          <TextField type="number" label="Shipping Fee" value={shippingFee} onChange={e => setShippingFee(e.target.value)} sx={{ width: 120 }} />
          <TextField type="number" label="Revenue" value={revenue} onChange={e => setRevenue(e.target.value)} sx={{ width: 120 }} required />
          <Select value={status} onChange={e => setStatus(e.target.value)} sx={{ minWidth: 120 }}>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
          {salesChannel && salesChannel.toLowerCase().includes('live') && (
            <Select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              displayEmpty
              sx={{ minWidth: 220 }}
            >
              <MenuItem value=""><em>Select Live-Selling Event</em></MenuItem>
              {liveEvents.map(ev => (
                <MenuItem key={ev.event_id} value={ev.event_id}>
                  {ev.event_date} | ฿{ev.ads_fee} {ev.notes ? `| ${ev.notes}` : ''}
                </MenuItem>
              ))}
            </Select>
          )}
        </Box>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={productRows.some(row => (
            (row.product_id && (row.quantity === '' || isNaN(Number(row.quantity)) || Number(row.quantity) <= 0)) ||
            (row.quantity !== '' && !row.product_id)
          ))}
        >
          Create Order
        </Button>
        {message && <Typography color={message.includes('success') ? 'green' : 'red'} mt={1}>{message}</Typography>}
      </form>
      <Box mt={4} width="100%">
        <Typography variant="h6">Order List</Typography>
        <TableContainer component={Paper} sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 110 }}>Sold Date</TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Products</TableCell>
                <TableCell>Sales Channel</TableCell>
                <TableCell>Revenue</TableCell>
                <TableCell>Shopee Fee</TableCell>
                <TableCell>Shipping Fee</TableCell>
                <TableCell>Seller Coupon</TableCell>
                <TableCell>Allocated Ads Fee</TableCell>
                <TableCell>Product Cost</TableCell>
                <TableCell>Total Cost</TableCell>
                <TableCell>Profit</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...orders]
                .sort((a, b) => new Date(b.sold_date) - new Date(a.sold_date))
                .map(order => (
                <TableRow key={order.sold_date}>
                  <TableCell>{order.sold_date ? order.sold_date : '-'}</TableCell>
                  <TableCell>{
                    order.order_id && order.order_id.length > 10
                      ? `${order.order_id.slice(0, 5)}...${order.order_id.slice(-5)}`
                      : order.order_id
                  }</TableCell>
                  <TableCell>
                    {order.products && order.products.map((item, idx) => {
                      const prod = products.find(p => String(p.product_id) === String(item.product_id));
                      return (
                        <div key={idx}>{prod ? prod.name : item.product_id} × {item.quantity}</div>
                      );
                    })}
                  </TableCell>
                  <TableCell>{order.sales_channel}</TableCell>
                  <TableCell>฿{Number(order.revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>฿{Number(order.shopee_fee).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>฿{Number(order.shipping_fee).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>฿{Number(order.seller_coupon).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    {order.live_selling_event_id && liveEvents.length > 0
                      ? (() => {
                          const ev = liveEvents.find(e => e.event_id === order.live_selling_event_id);
                          if (!ev) return '-';
                          // Count orders with this event_id
                          const count = orders.filter(o => o.live_selling_event_id === ev.event_id).length;
                          return count > 0 ? `฿${(ev.ads_fee / count).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-';
                        })()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {'฿' + (  
                      order.products
                        ? order.products.reduce((sum, item) => {
                            const prod = products.find(p => String(p.product_id) === String(item.product_id));
                            return sum + (prod ? (prod.purchase_price || 0) * (item.quantity || 1) : 0);
                          }, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })
                        : 0
                    )}
                  </TableCell>
                  <TableCell>
                    {'\u0e3f' + (order.total_cost !== undefined ? Number(order.total_cost).toLocaleString('en-US', { minimumFractionDigits: 2 }) : calculate_total_cost(order, products, liveEvents, orders))}
                  </TableCell>
                  <TableCell>
                    <Tooltip 
                      title={
                        <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
                          <div><strong>Profit Calculation:</strong></div>
                          <div>Revenue: ฿{Number(order.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                          <div>- Total Cost: ฿{order.total_cost !== undefined ? Number(order.total_cost).toLocaleString('en-US', { minimumFractionDigits: 2 }) : calculate_total_cost(order, products, liveEvents, orders)}</div>
                          <div style={{ borderTop: '1px solid #ccc', paddingTop: '4px', marginTop: '4px' }}>
                            <strong>= Profit: ฿{order.profit !== undefined ? Number(order.profit).toLocaleString('en-US', { minimumFractionDigits: 2 }) : calculate_profit(order, products, liveEvents, orders)}</strong>
                          </div>
                          <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.8 }}>
                            <div><strong>Cost Breakdown:</strong></div>
                            <div>• Product Cost: ฿{order.products ? order.products.reduce((sum, item) => {
                              const prod = products.find(p => String(p.product_id) === String(item.product_id));
                              return sum + (prod ? (prod.purchase_price || 0) * (item.quantity || 1) : 0);
                            }, 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}</div>
                            <div>• Product Shipping: ฿{order.products ? order.products.reduce((sum, item) => {
                              const prod = products.find(p => String(p.product_id) === String(item.product_id));
                              return sum + (prod ? (prod.shipping_fee || 0) * (item.quantity || 1) : 0);
                            }, 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}</div>
                            <div>• Shopee Fee: ฿{Number(order.shopee_fee || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            <div>• Shipping Fee: ฿{Number(order.shipping_fee || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            <div>• Seller Coupon: ฿{Number(order.seller_coupon || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            {order.live_selling_event_id && (
                              <div>• Ads Fee: ฿{(() => {
                                const ev = liveEvents.find(e => e.event_id === order.live_selling_event_id);
                                if (!ev) return '0.00';
                                const count = orders.filter(o => o.live_selling_event_id === ev.event_id).length;
                                return count > 0 ? (ev.ads_fee / count).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00';
                              })()}</div>
                            )}
                          </div>
                        </div>
                      }
                      placement="left"
                      arrow
                    >
                      <span style={{ cursor: 'help' }}>
                        {'฿' + (order.profit !== undefined ? Number(order.profit).toLocaleString('en-US', { minimumFractionDigits: 2 }) : calculate_profit(order, products, liveEvents, orders))}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onChange={async (e) => {
                        try {
                          await updateOrderStatus(order.order_id, e.target.value);
                          setMessage('Order status updated!');
                          getOrders().then(setOrders);
                        } catch {
                          setMessage('Failed to update status.');
                        }
                      }}
                      size="small"
                      sx={{ minWidth: 120 }}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};


function calculate_total_cost(order, products, liveEvents, orders) {
  const shopeeFee = Number(order.shopee_fee || 0);
  const shippingFee = Number(order.shipping_fee || 0);
  const sellerCoupon = Number(order.seller_coupon || 0);
  const productCost = order.products
    ? order.products.reduce((sum, item) => {
        const prod = products.find(p => String(p.product_id) === String(item.product_id));
        return sum + (prod ? (prod.purchase_price || 0) * (item.quantity || 1) : 0);
      }, 0)
    : 0;
  const adsFee = (order.live_selling_event_id && liveEvents.length > 0)
    ? (() => {
        const ev = liveEvents.find(e => e.event_id === order.live_selling_event_id);
        if (!ev) return 0;
        const count = orders.filter(o => o.live_selling_event_id === ev.event_id).length;
        return count > 0 ? (ev.ads_fee / count) : 0;
      })()
    : 0;
  const total = shopeeFee + shippingFee + sellerCoupon + productCost + adsFee;
  return total.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

function calculate_profit(order, products, liveEvents, orders) {
  const revenue = Number(order.revenue || 0);
  const shopeeFee = Number(order.shopee_fee || 0);
  const shippingFee = Number(order.shipping_fee || 0);
  const sellerCoupon = Number(order.seller_coupon || 0);
  const productCost = order.products
    ? order.products.reduce((sum, item) => {
        const prod = products.find(p => String(p.product_id) === String(item.product_id));
        return sum + (prod ? (prod.purchase_price || 0) * (item.quantity || 1) : 0);
      }, 0)
    : 0;
  const adsFee = (order.live_selling_event_id && liveEvents.length > 0)
    ? (() => {
        const ev = liveEvents.find(e => e.event_id === order.live_selling_event_id);
        if (!ev) return 0;
        const count = orders.filter(o => o.live_selling_event_id === ev.event_id).length;
        return count > 0 ? (ev.ads_fee / count) : 0;
      })()
    : 0;
  const profit = revenue - (shopeeFee + shippingFee + sellerCoupon + productCost + adsFee);
  return profit.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

export default Orders;
