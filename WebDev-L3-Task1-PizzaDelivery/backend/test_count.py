import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.pizza import Pizza

db = SessionLocal()
try:
    pizzas = db.query(Pizza).filter(Pizza.is_available == True).all()
    print(f"Active pizzas count: {len(pizzas)}")
    categories = {}
    for p in pizzas:
        categories[p.category] = categories.get(p.category, 0) + 1
    print("Categories breakdown:", categories)
    for p in pizzas[:10]:
        print(f"- [{p.category}] {p.name}: ₹{p.base_price}")
finally:
    db.close()
