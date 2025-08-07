from enum import Enum as PyEnum
from beanie import Document
from typing import Optional
from datetime import date
from pydantic import Field

class OrderStatus(PyEnum):
    PENDING = "pending"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

from pydantic import BaseModel
from typing import List

class OrderProductItem(BaseModel):
    product_id: str
    quantity: int

class Order(Document):
    # MongoDB _id is used by default
    products: List[OrderProductItem]
    sales_channel: str
    shopee_fee: Optional[float] = 0.0
    shipping_fee: Optional[float] = 0.0
    seller_coupon: Optional[float] = 0.0
    revenue: float
    total_cost: Optional[float] = 0.0
    profit: Optional[float] = 0.0
    sold_date: Optional[date] = Field(default_factory=date.today)
    status: str = Field(default=OrderStatus.PENDING.value)
    live_selling_event_id: Optional[str] = None  # Reference to LiveSellingEvent

    class Settings:
        name = "orders"

    async def calculate_profit_and_cost(self, product_lookup=None, ads_fee=0.0):
        # Calculate product cost using new formula
        product_cost = 0.0
        if product_lookup:
            for item in self.products:
                prod = product_lookup.get(item.product_id)
                if prod:
                    # (product price * quantity + product.shipping_fee / quantity)
                    shipping_fee_per_unit = (prod.shipping_fee or 0) / item.quantity if item.quantity else 0
                    product_cost += (prod.purchase_price or 0) * item.quantity + shipping_fee_per_unit * item.quantity
        total_cost = (
            product_cost
            + (self.shopee_fee or 0)
            + (self.shipping_fee or 0)
            + (self.seller_coupon or 0)
            + (ads_fee if self.live_selling_event_id else 0)
        )
        self.total_cost = total_cost
        self.profit = self.revenue - total_cost
        return self.profit
    
    @property
    def order_id(self):
        return str(self.id)

    def __repr__(self):
        return f"<Order(products={self.products}, status='{self.status}')>"
