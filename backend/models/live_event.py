from beanie import Document
from pydantic import Field
from typing import Optional, List
from datetime import date

class LiveSellingEvent(Document):
    event_date: date = Field(default_factory=date.today)
    ads_fee: float
    notes: Optional[str] = None

    class Settings:
        name = "live_selling_events"

    @property
    def event_id(self):
        return str(self.id)
