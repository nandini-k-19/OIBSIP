import sys
import os

# Ensure backend root is on sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base, engine, SessionLocal
from app.models.user import User, UserRole
from app.models.admin import Admin
from app.models.pizza import PizzaBase, Sauce, Cheese, Vegetable, Pizza
from app.auth.passwords import hash_password

def seed_database():
    print("Re-creating all tables with fresh normalized schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Admin Account
        print("Creating default Admin user (admin@pizzahub.com)...")
        admin_user = User(
            full_name="PizzaHub Master Admin",
            email="admin@pizzahub.com",
            hashed_password=hash_password("admin123"),
            role=UserRole.ADMIN,
            is_verified=True
        )
        db.add(admin_user)
        db.flush()

        admin_meta = Admin(
            user_id=admin_user.id,
            department="Operations & Inventory",
            permissions="all"
        )
        db.add(admin_meta)

        # 2. Seed Demo Customer Account
        print("Creating Demo Customer user (user@pizzahub.com)...")
        demo_user = User(
            full_name="Alex Customer",
            email="user@pizzahub.com",
            hashed_password=hash_password("user123"),
            role=UserRole.USER,
            is_verified=True
        )
        db.add(demo_user)

        # 3. Seed Pizza Bases (5 distinct bases)
        bases = [
            {"name": "Classic Hand-Tossed", "price": 120.0, "stock": 45, "threshold": 20, "description": "Traditional dough tossed to perfection with crisp golden edge."},
            {"name": "Thin Crust", "price": 140.0, "stock": 35, "threshold": 20, "description": "Ultra light, wafer-thin crispy Italian crust."},
            {"name": "Cheese Burst", "price": 190.0, "stock": 25, "threshold": 15, "description": "Stuffed with molten mozzarella and cheddar cheese blend."},
            {"name": "Whole Wheat Grain", "price": 150.0, "stock": 30, "threshold": 15, "description": "Nutritious 100% whole wheat stoneground base."},
            {"name": "Italian Herb Sourdough", "price": 170.0, "stock": 18, "threshold": 20, "description": "Slow-fermented sourdough infused with rosemary & oregano."}
        ]
        for b_data in bases:
            db.add(PizzaBase(**b_data, is_available=True))

        # 4. Seed Sauces (5 distinct sauces)
        sauces = [
            {"name": "Classic Tomato Marinara", "price": 40.0, "stock": 60, "threshold": 25, "description": "San Marzano tomatoes simmered with fresh basil and garlic."},
            {"name": "Spicy Arrabbiata", "price": 45.0, "stock": 50, "threshold": 20, "description": "Fiery red chili and slow-roasted garlic tomato reduction."},
            {"name": "Creamy Garlic Alfredo", "price": 60.0, "stock": 40, "threshold": 20, "description": "Rich white sauce crafted from heavy cream and aged parmesan."},
            {"name": "Smoky BBQ Swirl", "price": 50.0, "stock": 35, "threshold": 15, "description": "Tangy hickory wood smoked sweet barbecue sauce."},
            {"name": "Gourmet Basil Pesto", "price": 65.0, "stock": 22, "threshold": 20, "description": "Fresh Genovese basil crushed with pine nuts, olive oil, and parmesan."}
        ]
        for s_data in sauces:
            db.add(Sauce(**s_data, is_available=True))

        # 5. Seed Cheeses
        cheeses = [
            {"name": "Fresh Mozzarella", "price": 70.0, "stock": 55, "threshold": 25, "description": "Classic creamy stretchy shredded cow milk mozzarella."},
            {"name": "Sharp Cheddar", "price": 80.0, "stock": 40, "threshold": 20, "description": "Aged English cheddar offering robust sharp flavors."},
            {"name": "Grated Parmesan Reggiano", "price": 90.0, "stock": 30, "threshold": 15, "description": "Granular crystalline dry-aged Italian cheese."},
            {"name": "Crumbled Greek Feta", "price": 85.0, "stock": 28, "threshold": 15, "description": "Brined salty sheep's milk cheese curd."},
            {"name": "Four-Cheese Gourmet Blend", "price": 110.0, "stock": 19, "threshold": 20, "description": "Artisan mix of Mozzarella, Provolone, Fontina, and Gouda."}
        ]
        for c_data in cheeses:
            db.add(Cheese(**c_data, is_available=True))

        # 6. Seed Vegetables
        vegetables = [
            {"name": "Red Onion", "price": 30.0, "stock": 80, "threshold": 30, "description": "Crisp sweet purple onions."},
            {"name": "Green Capsicum", "price": 35.0, "stock": 70, "threshold": 25, "description": "Crunchy farm-fresh green bell peppers."},
            {"name": "Juicy Roma Tomatoes", "price": 30.0, "stock": 65, "threshold": 25, "description": "Ripe diced Roma tomatoes."},
            {"name": "Golden Sweet Corn", "price": 35.0, "stock": 60, "threshold": 20, "description": "Sweet steamed yellow corn kernels."},
            {"name": "Button Mushrooms", "price": 45.0, "stock": 45, "threshold": 20, "description": "Fresh earthy white button mushroom slices."},
            {"name": "Black Kalamata Olives", "price": 50.0, "stock": 40, "threshold": 15, "description": "Tender pitted Spanish black olives."},
            {"name": "Pickled Jalapeños", "price": 40.0, "stock": 50, "threshold": 20, "description": "Zesty spicy Mexican pickled jalapeño rings."},
            {"name": "Baby Spinach", "price": 35.0, "stock": 15, "threshold": 20, "description": "Tender organic baby spinach leaves."}
        ]
        for v_data in vegetables:
            db.add(Vegetable(**v_data, is_available=True))

        db.commit()

        # 7. Seed Signature Pizzas (28 Varieties)
        b_hand = db.query(PizzaBase).filter(PizzaBase.name == "Classic Hand-Tossed").first()
        b_thin = db.query(PizzaBase).filter(PizzaBase.name == "Thin Crust").first()
        b_burst = db.query(PizzaBase).filter(PizzaBase.name == "Cheese Burst").first()
        b_wheat = db.query(PizzaBase).filter(PizzaBase.name == "Whole Wheat Grain").first()
        b_sourdough = db.query(PizzaBase).filter(PizzaBase.name == "Italian Herb Sourdough").first()

        s_marinara = db.query(Sauce).filter(Sauce.name == "Classic Tomato Marinara").first()
        s_arrabbiata = db.query(Sauce).filter(Sauce.name == "Spicy Arrabbiata").first()
        s_alfredo = db.query(Sauce).filter(Sauce.name == "Creamy Garlic Alfredo").first()
        s_bbq = db.query(Sauce).filter(Sauce.name == "Smoky BBQ Swirl").first()
        s_pesto = db.query(Sauce).filter(Sauce.name == "Gourmet Basil Pesto").first()

        c_mozzarella = db.query(Cheese).filter(Cheese.name == "Fresh Mozzarella").first()
        c_four = db.query(Cheese).filter(Cheese.name == "Four-Cheese Gourmet Blend").first()
        c_cheddar = db.query(Cheese).filter(Cheese.name == "Sharp Cheddar").first()
        c_parmesan = db.query(Cheese).filter(Cheese.name == "Grated Parmesan Reggiano").first()
        c_feta = db.query(Cheese).filter(Cheese.name == "Crumbled Greek Feta").first()

        pizzas = [
            # Veg
            {"name": "Margherita Classica", "description": "Authentic Naples style pizza with aromatic basil marinara, fresh mozzarella slices, and extra virgin olive oil.", "category": "veg", "base_price": 299.0, "image_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80", "base_id": b_hand.id if b_hand else None, "sauce_id": s_marinara.id if s_marinara else None, "cheese_id": c_mozzarella.id if c_mozzarella else None, "is_available": True},
            {"name": "Farmhouse Supreme", "description": "Loaded with fresh crunchy capsicum, sweet corn, diced red onions, juicy tomatoes, and golden baked mozzarella.", "category": "veg", "base_price": 379.0, "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80", "base_id": b_hand.id if b_hand else None, "sauce_id": s_marinara.id if s_marinara else None, "cheese_id": c_mozzarella.id if c_mozzarella else None, "is_available": True},
            {"name": "Tuscan White Truffle & Mushroom", "description": "Creamy garlic alfredo base layered with button mushrooms, wilted spinach, and gourmet four-cheese blend on thin crust.", "category": "veg", "base_price": 449.0, "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80", "base_id": b_thin.id if b_thin else None, "sauce_id": s_alfredo.id if s_alfredo else None, "cheese_id": c_four.id if c_four else None, "is_available": True},
            {"name": "Spicy Fiery Diablo", "description": "Spicy Arrabbiata sauce base topped with fiery jalapeños, red onions, capsicum, and melted mozzarella on cheese burst crust.", "category": "veg", "base_price": 429.0, "image_url": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80", "base_id": b_burst.id if b_burst else None, "sauce_id": s_arrabbiata.id if s_arrabbiata else None, "cheese_id": c_mozzarella.id if c_mozzarella else None, "is_available": True},
            {"name": "Pesto Genovese & Black Olive", "description": "Fragrant Genovese pesto sauce with sliced black olives, cherry tomatoes, and crumbled Greek feta over hand-tossed dough.", "category": "veg", "base_price": 399.0, "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80", "base_id": b_hand.id if b_hand else None, "sauce_id": s_pesto.id if s_pesto else None, "cheese_id": c_feta.id if c_feta else None, "is_available": True},
            {"name": "Paneer Tikka Special", "description": "Marinated tandoori paneer cubes, crisp capsicum, diced red onions, and hot chili flakes over spicy sauce.", "category": "veg", "base_price": 419.0, "image_url": "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=600&q=80", "base_id": b_hand.id if b_hand else None, "sauce_id": s_arrabbiata.id if s_arrabbiata else None, "cheese_id": c_mozzarella.id if c_mozzarella else None, "is_available": True},
            {"name": "Four Cheese Quattro Formaggi", "description": "Decadent four-cheese melange of Fior di Latte Mozzarella, aged English Cheddar, Parmesan Reggiano, and Greek Feta.", "category": "veg", "base_price": 469.0, "image_url": "https://images.unsplash.com/photo-1548369937-47519962c11a?auto=format&fit=crop&w=600&q=80", "base_id": b_burst.id if b_burst else None, "sauce_id": s_marinara.id if s_marinara else None, "cheese_id": c_four.id if c_four else None, "is_available": True},
            {"name": "Florentine Spinach & Sweet Corn", "description": "Tender baby spinach leaves, steamed golden corn, creamy alfredo drizzle, and cracked black pepper on sourdough.", "category": "veg", "base_price": 369.0, "image_url": "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80", "base_id": b_sourdough.id if b_sourdough else None, "sauce_id": s_alfredo.id if s_alfredo else None, "cheese_id": c_mozzarella.id if c_mozzarella else None, "is_available": True},
            {"name": "Mediterranean Sun-Dried Tomato", "description": "Rich sun-dried tomatoes, Kalamata black olives, crumbled feta, and fresh oregano over artisanal thin crust.", "category": "veg", "base_price": 409.0, "image_url": "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=600&q=80", "base_id": b_thin.id if b_thin else None, "sauce_id": s_marinara.id if s_marinara else None, "cheese_id": c_feta.id if c_feta else None, "is_available": True},
            {"name": "Garden Fresh Veggie Delight", "description": "Loaded colorful medley of crisp bell peppers, sweet corn, mushrooms, red onions, and Roma tomatoes.", "category": "veg", "base_price": 349.0, "image_url": "https://images.unsplash.com/photo-1564936281291-294551497d81?auto=format&fit=crop&w=600&q=80", "base_id": b_wheat.id if b_wheat else None, "sauce_id": s_marinara.id if s_marinara else None, "cheese_id": c_mozzarella.id if c_mozzarella else None, "is_available": True},

            # Non-Veg
            {"name": "Peri Peri Smoked Chicken", "description": "Tender pulled chicken tossed in fiery African peri peri glaze with red paprika, onions, and molten mozzarella.", "category": "non-veg", "base_price": 479.0, "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80", "base_id": b_hand.id if b_hand else None, "sauce_id": s_arrabbiata.id if s_arrabbiata else None, "cheese_id": c_mozzarella.id if c_mozzarella else None, "is_available": True},
            {"name": "Hickory BBQ Smoked Chicken", "description": "Slow-smoked chicken chunks swirled in hickory BBQ glaze, caramelized onions, and sharp cheddar cheese.", "category": "non-veg", "base_price": 489.0, "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80", "base_id": b_thin.id if b_thin else None, "sauce_id": s_bbq.id if s_bbq else None, "cheese_id": c_cheddar.id if c_cheddar else None, "is_available": True},
            {"name": "Spicy Chicken Pepperoni Inferno", "description": "Double spicy chicken pepperoni slices, pickled jalapeños, crushed chili flakes, and molten cheese burst crust.", "category": "non-veg", "base_price": 529.0, "image_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80", "base_id": b_burst.id if b_burst else None, "sauce_id": s_arrabbiata.id if s_arrabbiata else None, "cheese_id": c_mozzarella.id if c_mozzarella else None, "is_available": True},
            {"name": "Butter Chicken Royale", "description": "Makhani simmered chicken tikka morsels, fresh coriander, ginger juliennes, and cream drizzle on sourdough.", "category": "non-veg", "base_price": 499.0, "image_url": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80", "base_id": b_sourdough.id if b_sourdough else None, "sauce_id": s_marinara.id if s_marinara else None, "cheese_id": c_mozzarella.id if c_mozzarella else None, "is_available": True},
            {"name": "Smoked Chicken Sausage Feast", "description": "Sliced smoked chicken herb sausages, caramelized bell peppers, onions, and extra stringy mozzarella.", "category": "non-veg", "base_price": 459.0, "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80", "base_id": b_hand.id if b_hand else None, "sauce_id": s_marinara.id if s_marinara else None, "cheese_id": c_mozzarella.id if c_mozzarella else None, "is_available": True},
            {"name": "Tandoori Chicken Tikka Supreme", "description": "Clay-oven roasted spicy chicken tikka, crunchy bell peppers, red onions, and mint yogurt drizzle.", "category": "non-veg", "base_price": 489.0, "image_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80", "base_id": b_hand.id if b_hand else None, "sauce_id": s_arrabbiata.id if s_arrabbiata else None, "cheese_id": c_mozzarella.id if c_mozzarella else None, "is_available": True},
            {"name": "Creamy Garlic Alfredo Chicken", "description": "Pan-seared herb chicken breast, sliced portobello mushrooms, creamy parmesan alfredo sauce, and fresh thyme.", "category": "non-veg", "base_price": 519.0, "image_url": "https://images.unsplash.com/photo-1548369937-47519962c11a?auto=format&fit=crop&w=600&q=80", "base_id": b_thin.id if b_thin else None, "sauce_id": s_alfredo.id if s_alfredo else None, "cheese_id": c_parmesan.id if c_parmesan else None, "is_available": True},
            {"name": "Meat Lovers Carnivore Special", "description": "Loaded with roasted chicken, spiced chicken meatballs, herb sausages, and smoky BBQ drizzle.", "category": "non-veg", "base_price": 549.0, "image_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80", "base_id": b_burst.id if b_burst else None, "sauce_id": s_bbq.id if s_bbq else None, "cheese_id": c_four.id if c_four else None, "is_available": True},

            # Specialty
            {"name": "Burrata Gold Truffle Masterpiece", "description": "Whole artisanal fresh Burrata cheese sphere, shaved black summer truffles, organic arugula, and 24k gold olive drizzle.", "category": "specialty", "base_price": 649.0, "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80", "base_id": b_sourdough.id if b_sourdough else None, "sauce_id": s_pesto.id if s_pesto else None, "cheese_id": c_four.id if c_four else None, "is_available": True},
            {"name": "Chef Pizzo Signature Diablo", "description": "Chef Pizzo's award-winning secret recipe with triple smoked cheese, charred sweet peppers, hot honey, and ghost pepper spice.", "category": "specialty", "base_price": 599.0, "image_url": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80", "base_id": b_burst.id if b_burst else None, "sauce_id": s_arrabbiata.id if s_arrabbiata else None, "cheese_id": c_four.id if c_four else None, "is_available": True},
            {"name": "Sicilian Caprese & Sweet Pesto", "description": "Fresh buffalo mozzarella rounds, heirloom cherry tomatoes, sweet Genovese pesto swirl, and aged balsamic glaze.", "category": "specialty", "base_price": 499.0, "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80", "base_id": b_thin.id if b_thin else None, "sauce_id": s_pesto.id if s_pesto else None, "cheese_id": c_mozzarella.id if c_mozzarella else None, "is_available": True},
            {"name": "Smoky Honey & Goat Cheese", "description": "Creamy goat cheese crumbles, caramelized red onions, crushed walnuts, and chili infused organic wildflower honey.", "category": "specialty", "base_price": 529.0, "image_url": "https://images.unsplash.com/photo-1548369937-47519962c11a?auto=format&fit=crop&w=600&q=80", "base_id": b_sourdough.id if b_sourdough else None, "sauce_id": s_alfredo.id if s_alfredo else None, "cheese_id": c_feta.id if c_feta else None, "is_available": True},
            {"name": "Napoli Garlic Butter Crust", "description": "Whole roasted garlic cloves, rosemary infused olive oil, San Marzano marinara, and aged parmesan crust.", "category": "specialty", "base_price": 439.0, "image_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80", "base_id": b_sourdough.id if b_sourdough else None, "sauce_id": s_marinara.id if s_marinara else None, "cheese_id": c_parmesan.id if c_parmesan else None, "is_available": True},
            {"name": "Avocado Garden & Herb Crisp", "description": "Sliced ripe Hass avocados, cherry tomatoes, baby arugula, cold pressed extra virgin oil, and lemon zest on thin base.", "category": "specialty", "base_price": 479.0, "image_url": "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80", "base_id": b_thin.id if b_thin else None, "sauce_id": s_pesto.id if s_pesto else None, "cheese_id": c_feta.id if c_feta else None, "is_available": True},
            {"name": "Spicy Peri Peri Paneer Burst", "description": "Peri peri marinated cottage cheese cubes, sweet corn, spicy jalapeño rounds, and double molten cheese explosion.", "category": "specialty", "base_price": 489.0, "image_url": "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=600&q=80", "base_id": b_burst.id if b_burst else None, "sauce_id": s_arrabbiata.id if s_arrabbiata else None, "cheese_id": c_four.id if c_four else None, "is_available": True},
            {"name": "Firecracker Ghost Pepper Extreme", "description": "Extreme spicy warning! Ghost pepper infused tomato sauce, Carolina Reaper flakes, jalapeños, and soothing cheddar.", "category": "specialty", "base_price": 539.0, "image_url": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80", "base_id": b_burst.id if b_burst else None, "sauce_id": s_arrabbiata.id if s_arrabbiata else None, "cheese_id": c_cheddar.id if c_cheddar else None, "is_available": True},
            {"name": "Portobello & Wild Mushroom Truffle", "description": "Wild forest mushrooms, porcini extract, caramelized garlic, fresh rosemary, and grated Parmesan Reggiano.", "category": "specialty", "base_price": 529.0, "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80", "base_id": b_thin.id if b_thin else None, "sauce_id": s_alfredo.id if s_alfredo else None, "cheese_id": c_parmesan.id if c_parmesan else None, "is_available": True},
            {"name": "Grand Royale 5-Star Gourmet", "description": "The crowning jewel: slow fermented sourdough base, smoked barbecue sauce, 4 artisan cheeses, and chef's daily spice blend.", "category": "specialty", "base_price": 699.0, "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80", "base_id": b_sourdough.id if b_sourdough else None, "sauce_id": s_bbq.id if s_bbq else None, "cheese_id": c_four.id if c_four else None, "is_available": True}
        ]

        for p_data in pizzas:
            db.add(Pizza(**p_data))

        db.commit()
        print("Database initialized and seeded successfully in MySQL!")
        print("Admin Login: admin@pizzahub.com / admin123")
        print("Customer Login: user@pizzahub.com / user123")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
