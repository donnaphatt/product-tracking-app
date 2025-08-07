from pydantic import BaseModel, Field
from typing import Any
from typing import Optional, List
from datetime import date

class LiveSellingEventCreate(BaseModel):
    ads_fee: float
    event_date: date = Field(default_factory=date.today)
    notes: Optional[str] = None

class LiveSellingEventResponse(BaseModel):
    event_id: str
    event_date: date
    ads_fee: float
    notes: Optional[str] = None

    @classmethod
    def from_event(cls, event: Any):
        return cls(
            event_id=str(event.id),
            event_date=event.event_date,
            ads_fee=event.ads_fee,
            notes=event.notes,
        )

class ProductCreate(BaseModel):
    name: str
    purchase_price: float
    shipping_fee: Optional[float] = 0.0
    purchase_date: Optional[date] = Field(default_factory=date.today)
    registration_date: Optional[date] = Field(default_factory=date.today)
    start_quantity: int
    supplier_id: Optional[int] = None

class ProductResponse(BaseModel):
    product_id: str
    name: str
    purchase_price: float
    shipping_fee: Optional[float] = 0.0
    purchase_date: Optional[date]
    registration_date: Optional[date]
    start_quantity: int
    remaining_quantity: int
    supplier_id: Optional[int] = None
    
    @classmethod
    def from_product(cls, product: Any):
        return cls(
            product_id=str(product.id),
            name=product.name,
            purchase_price=product.purchase_price,
            purchase_date=product.purchase_date,
            registration_date=product.registration_date,
            start_quantity=product.start_quantity,
            remaining_quantity=product.remaining_quantity,
            supplier_id=product.supplier_id,
        )

class OrderProductItem(BaseModel):
    product_id: str
    quantity: int

class OrderResponse(BaseModel):
    order_id: str
    products: List[OrderProductItem]
    sales_channel: str
    shopee_fee: Optional[float] = 0.0
    shipping_fee: Optional[float] = 0.0
    seller_coupon: Optional[float] = 0.0
    revenue: float
    total_cost: Optional[float] = 0.0
    profit: Optional[float] = 0.0
    sold_date: Optional[date]
    status: str
    live_selling_event_id: Optional[str] = None

    @classmethod
    def from_order(cls, order):
        products = [item.dict() if hasattr(item, 'dict') else dict(item) for item in order.products]
        return cls(
            order_id=str(order.id),
            products=products,
            sales_channel=order.sales_channel,
            shopee_fee=order.shopee_fee,
            shipping_fee=order.shipping_fee,
            seller_coupon=order.seller_coupon,
            revenue=order.revenue,
            total_cost=order.total_cost,
            profit=order.profit,
            sold_date=order.sold_date,
            status=order.status,
            live_selling_event_id=getattr(order, 'live_selling_event_id', None)
        )

class OrderUpdate(BaseModel):
    status: str

class OrderCreate(BaseModel):
    products: List[OrderProductItem]
    sales_channel: str
    shopee_fee: Optional[float] = 0.0
    shipping_fee: Optional[float] = 0.0
    seller_coupon: Optional[float] = 0.0
    revenue: float
    total_cost: Optional[float] = 0.0
    sold_date: Optional[date] = Field(default_factory=date.today)
    status: Optional[str] = "pending"
    live_selling_event_id: Optional[str] = None
