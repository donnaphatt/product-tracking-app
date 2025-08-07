from dotenv import load_dotenv
import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://mongo:27017/product_tracking")

# Call this in FastAPI startup event
async def init_db():
    from models.product import Product
    from models.order import Order
    from models.live_event import LiveSellingEvent
    client = AsyncIOMotorClient(MONGODB_URL)
    await init_beanie(database=client.get_default_database(), document_models=[Product, Order, LiveSellingEvent])

