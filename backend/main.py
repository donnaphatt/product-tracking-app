from fastapi import FastAPI, HTTPException, Depends
from typing import List
from database import init_db
from models.product import Product
from models.order import Order
from models.schemas import ProductCreate, OrderCreate, ProductResponse, OrderUpdate, OrderResponse, LiveSellingEventCreate, LiveSellingEventResponse
from models.live_event import LiveSellingEvent

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Product Tracking API")

# Allow CORS for local frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def app_init():
    await init_db()

@app.get("/health")
async def health_check():
    try:
        # Check database connectivity
        await Product.find_one()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

@app.post("/products/", response_model=ProductCreate)
async def create_product(product: ProductCreate):
    # Set both start and remaining quantity on creation
    product_doc = Product(
        name=product.name,
        purchase_price=product.purchase_price,
        shipping_fee=product.shipping_fee,
        purchase_date=product.purchase_date,
        registration_date=product.registration_date,
        start_quantity=product.start_quantity,
        remaining_quantity=product.start_quantity,
        supplier_id=product.supplier_id
    )
    await product_doc.insert()
    return product_doc

@app.get("/products/", response_model=List[ProductResponse])
async def read_products(skip: int = 0, limit: int = 100):
    products = await Product.find_all().skip(skip).limit(limit).to_list()
    return products

@app.delete("/products/{product_id}")
async def delete_product(product_id: str):
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await product.delete()
    return {"detail": "Product deleted successfully"}

@app.post("/orders/", response_model=OrderResponse)
async def create_order(order: OrderCreate):
    # Check and update product stock
    for item in order.products:
        product = await Product.get(item.product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.remaining_quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for product {product.name}")
        product.remaining_quantity -= item.quantity
        await product.save()
    order_doc = Order(**order.dict())
    # Calculate profit using new logic
    products = await Product.find_all().to_list()
    product_lookup = {str(p.id): p for p in products}
    ads_fee = 0.0
    if order.live_selling_event_id:
        from models.live_event import LiveSellingEvent
        event = await LiveSellingEvent.get(order.live_selling_event_id)
        if event:
            # Count orders for this event
            from models.order import Order as OrderModel
            linked_orders = await OrderModel.find({"live_selling_event_id": order.live_selling_event_id}).to_list()
            ads_fee = (event.ads_fee or 0) / max(len(linked_orders) + 1, 1)  # +1 for this new order
    await order_doc.calculate_profit_and_cost(product_lookup=product_lookup, ads_fee=ads_fee)
    await order_doc.insert()

    # If this order is linked to a live selling event, update profit and total_cost for all linked orders
    if order.live_selling_event_id and event:
        # Fetch all orders again (including the new one)
        from models.order import Order as OrderModel
        all_linked_orders = await OrderModel.find({"live_selling_event_id": order.live_selling_event_id}).to_list()
        total_linked = len(all_linked_orders)
        if total_linked > 0:
            ads_fee_per_order = (event.ads_fee or 0) / total_linked
            for o in all_linked_orders:
                await o.calculate_profit_and_cost(product_lookup=product_lookup, ads_fee=ads_fee_per_order)
                await o.save()

    return OrderResponse.from_order(order_doc)

@app.get("/orders/", response_model=List[OrderResponse])
async def read_orders(skip: int = 0, limit: int = 100):
    orders = await Order.find_all().skip(skip).limit(limit).to_list()
    return [OrderResponse.from_order(o) for o in orders]

from beanie import PydanticObjectId

# --- Live Selling Event Endpoints ---

@app.post("/live_events/", response_model=LiveSellingEventResponse)
async def create_live_event(event: LiveSellingEventCreate):
    obj = LiveSellingEvent(**event.dict())
    await obj.insert()
    return LiveSellingEventResponse.from_event(obj)

@app.get("/live_events/", response_model=List[LiveSellingEventResponse])
async def list_live_events():
    events = await LiveSellingEvent.find_all().to_list()
    return [LiveSellingEventResponse.from_event(e) for e in events]

@app.get("/live_events/{event_id}", response_model=LiveSellingEventResponse)
async def get_live_event(event_id: str):
    event = await LiveSellingEvent.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return LiveSellingEventResponse.from_event(event)

@app.delete("/live_events/{event_id}")
async def delete_live_event(event_id: str):
    event = await LiveSellingEvent.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    await event.delete()
    return {"detail": "Event deleted successfully"}

@app.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(order_id: PydanticObjectId):
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderResponse.from_order(order)

@app.patch("/orders/{order_id}", response_model=OrderResponse)
async def update_order_status(order_id: PydanticObjectId, update: OrderUpdate):
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = update.status
    await order.save()
    return OrderResponse.from_order(order)

from datetime import datetime

@app.get("/analytics/")
async def get_analytics():
    orders = await Order.find_all().to_list()
    products = await Product.find_all().to_list()
    product_lookup = {str(p.id): p for p in products}

    # Fetch all live-selling events and build lookup
    from models.live_event import LiveSellingEvent
    events = await LiveSellingEvent.find_all().to_list()
    event_lookup = {str(e.id): e for e in events}
    # Map event_id to list of orders
    event_orders = {}
    for order in orders:
        if order.live_selling_event_id:
            event_orders.setdefault(order.live_selling_event_id, []).append(order)

    total_revenue = 0.0
    total_profit = 0.0
    for order in orders:
        # Allocate ads_fee if order is linked to event
        ads_fee = 0.0
        if order.live_selling_event_id and order.live_selling_event_id in event_lookup:
            event = event_lookup[order.live_selling_event_id]
            linked_orders = event_orders[order.live_selling_event_id]
            ads_fee = (event.ads_fee or 0) / max(len(linked_orders), 1)
        order_total_cost = (
            (order.shopee_fee or 0)
            + ads_fee
            + (order.shipping_fee or 0)
            + sum((product_lookup.get(item.product_id).purchase_price or 0) * item.quantity for item in order.products if product_lookup.get(item.product_id))
            - (order.seller_coupon or 0)
        )
        total_revenue += order.revenue
        total_profit += order.revenue - order_total_cost

    today = datetime.now().date()
    days_in_inventory = [
        (today - (p.registration_date or today)).days
        for p in products if p.registration_date
    ]
    average_days_in_inventory = sum(days_in_inventory) / len(days_in_inventory) if days_in_inventory else 0

    return {
        "total_revenue": total_revenue,
        "total_profit": total_profit,
        "average_days_in_inventory": average_days_in_inventory
    }

