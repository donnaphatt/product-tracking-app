from beanie import Document
from bson import ObjectId
from pydantic import Field
from typing import Optional
from datetime import date
from enum import Enum as PyEnum

class SalesChannel(PyEnum):
    SHOPEE = "shopee"
    LIVE_SELLING = "live_selling"

class Product(Document):
    name: str
    purchase_price: float
    shipping_fee: Optional[float] = 0.0
    purchase_date: Optional[date] = Field(default_factory=date.today)
    registration_date: Optional[date] = Field(default_factory=date.today)
    start_quantity: int
    remaining_quantity: int
    supplier_id: Optional[int] = None

    class Settings:
        name = "products"

    @property
    def product_id(self):
        return str(self.id)

    def __repr__(self):
        return f"<Product(name='{self.name}', shipping_fee={self.shipping_fee}, quantity={self.remaining_quantity})>"
