import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, deleteProduct } from '../api';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Button, Box } from '@mui/material';

const Products = () => {
  const [products, setProducts] = useState([]);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [productRows, setProductRows] = useState([
    { name: '', purchasePrice: '', startQuantity: '', registrationDate: todayStr }
  ]);
  const [sharedShippingFee, setSharedShippingFee] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
    for (let row of productRows) {
      if (!row.name || !row.purchasePrice || !row.startQuantity) {
        hasError = true;
      }
    }
    if (hasError) {
      setMessage('Please fill in all required fields for all products.');
      return;
    }
    try {
      const totalProducts = productRows.length;
      const shippingFeePerProduct = totalProducts > 0 ? Number(sharedShippingFee || 0) / totalProducts : 0;
      
      for (let row of productRows) {
        await createProduct({
          name: row.name,
          purchase_price: Number(row.purchasePrice),
          shipping_fee: shippingFeePerProduct,
          start_quantity: Number(row.startQuantity),
          registration_date: row.registrationDate || todayStr
        });
      }
      setProductRows([{ name: '', purchasePrice: '', startQuantity: '', registrationDate: todayStr }]);
      setSharedShippingFee('');
      setMessage('All products added!');
      getProducts().then(setProducts);
    } catch {
      setMessage('Failed to add products.');
    }
  };

  const handleRowChange = (idx, field, value) => {
    const rows = [...productRows];
    rows[idx][field] = value;
    setProductRows(rows);
  };

  const handleAddRow = () => {
    setProductRows([
      ...productRows,
      { name: '', purchasePrice: '', startQuantity: '', registrationDate: todayStr }
    ]);
  };

  const handleRemoveRow = (idx) => {
    if (productRows.length === 1) return;
    setProductRows(productRows.filter((_, i) => i !== idx));
  };




  return (
    <div>
      <Typography variant="h4" gutterBottom>Products</Typography>
      <Box component="form" onSubmit={handleSubmit} mb={3} display="flex" flexDirection="column" gap={2}>
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <TextField 
            label="Total Shipping Fee (฿)" 
            type="number" 
            value={sharedShippingFee} 
            onChange={e => setSharedShippingFee(e.target.value)} 
            sx={{ minWidth: 160 }} 
            helperText={productRows.length > 1 ? `฿${(Number(sharedShippingFee || 0) / productRows.length).toFixed(2)} per product` : ''}
          />
        </Box>
        {productRows.map((row, idx) => (
          <Box key={idx} display="flex" gap={2} alignItems="center">
            <TextField label="Name" value={row.name} onChange={e => handleRowChange(idx, 'name', e.target.value)} required sx={{ minWidth: 140 }} />
            <TextField label="Price (฿)" type="number" value={row.purchasePrice} onChange={e => handleRowChange(idx, 'purchasePrice', e.target.value)} required sx={{ minWidth: 100 }} />

            <TextField label="Start Quantity" value={row.startQuantity} onChange={e => handleRowChange(idx, 'startQuantity', e.target.value)} required sx={{ width: 120 }} />
            <TextField label="Registration Date" type="date" value={row.registrationDate} onChange={e => handleRowChange(idx, 'registrationDate', e.target.value)} sx={{ minWidth: 160 }} InputLabelProps={{ shrink: true }} />
            <Button type="button" variant="outlined" color="error" onClick={() => handleRemoveRow(idx)} disabled={productRows.length === 1}>Remove</Button>
          </Box>
        ))}
        <Box display="flex" gap={2} mt={1}>
          <Button type="button" variant="outlined" onClick={handleAddRow}>Add Row</Button>
          <Button type="submit" variant="contained">Add All Products</Button>
        </Box>
        {message && <Typography color={message.includes('added') ? 'green' : 'red'}>{message}</Typography>}
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Shipping Fee</TableCell>
              <TableCell>Start Quantity</TableCell>
              <TableCell>Remaining Quantity</TableCell>
              <TableCell>Registration Date</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.filter(product => product.remaining_quantity > 0).map((product) => (
              <TableRow key={product.product_id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>฿{Number(product.purchase_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>฿{Number(product.shipping_fee || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{product.start_quantity}</TableCell>
                <TableCell>{product.remaining_quantity}</TableCell>
                <TableCell>{product.registration_date ? new Date(product.registration_date).toLocaleDateString() : ''}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={async () => {
                      if (window.confirm(`Delete product '${product.name}'?`)) {
                        try {
                          await deleteProduct(product.product_id);
                          setMessage(`Deleted '${product.name}' successfully!`);
                          getProducts().then(setProducts);
                        } catch {
                          setMessage('Failed to delete product.');
                        }
                      }
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Out of Stock Section */}
      {products.filter(product => product.remaining_quantity === 0).length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" color="error" gutterBottom>Out of Stock</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Shipping Fee</TableCell>
                  <TableCell>Start Quantity</TableCell>
                  <TableCell>Registration Date</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.filter(product => product.remaining_quantity === 0).map(product => (
                  <TableRow key={product.product_id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>฿{Number(product.purchase_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>฿{Number(product.shipping_fee || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{product.start_quantity}</TableCell>
                    <TableCell>{product.registration_date ? new Date(product.registration_date).toLocaleDateString() : ''}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={async () => {
                          if (window.confirm(`Delete product '${product.name}'?`)) {
                            try {
                              await deleteProduct(product.product_id);
                              setMessage(`Deleted '${product.name}' successfully!`);
                              getProducts().then(setProducts);
                            } catch {
                              setMessage('Failed to delete product.');
                            }
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

    </div>
  );
};

export default Products;
