import sys
import os

# Ensure backend root is on sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.pizza import PizzaBase, Sauce, Cheese, Pizza

def seed_expanded_pizzas():
    db = SessionLocal()
    try:
        # Fetch base references
        b_hand = db.query(PizzaBase).filter(PizzaBase.name.ilike("%Hand-Tossed%")).first()
        b_thin = db.query(PizzaBase).filter(PizzaBase.name.ilike("%Thin%")).first()
        b_burst = db.query(PizzaBase).filter(PizzaBase.name.ilike("%Cheese Burst%")).first()
        b_wheat = db.query(PizzaBase).filter(PizzaBase.name.ilike("%Whole Wheat%")).first()
        b_sourdough = db.query(PizzaBase).filter(PizzaBase.name.ilike("%Sourdough%")).first()

        default_base_id = b_hand.id if b_hand else None

        # Fetch sauce references
        s_marinara = db.query(Sauce).filter(Sauce.name.ilike("%Marinara%")).first()
        s_arrabbiata = db.query(Sauce).filter(Sauce.name.ilike("%Arrabbiata%")).first()
        s_alfredo = db.query(Sauce).filter(Sauce.name.ilike("%Alfredo%")).first()
        s_bbq = db.query(Sauce).filter(Sauce.name.ilike("%BBQ%")).first()
        s_pesto = db.query(Sauce).filter(Sauce.name.ilike("%Pesto%")).first()

        default_sauce_id = s_marinara.id if s_marinara else None

        # Fetch cheese references
        c_mozzarella = db.query(Cheese).filter(Cheese.name.ilike("%Mozzarella%")).first()
        c_four = db.query(Cheese).filter(Cheese.name.ilike("%Four-Cheese%")).first()
        c_cheddar = db.query(Cheese).filter(Cheese.name.ilike("%Cheddar%")).first()
        c_parmesan = db.query(Cheese).filter(Cheese.name.ilike("%Parmesan%")).first()
        c_feta = db.query(Cheese).filter(Cheese.name.ilike("%Feta%")).first()

        default_cheese_id = c_mozzarella.id if c_mozzarella else None

        # Expanded 28 Pizza Varieties List
        expanded_pizzas = [
            # --- VEG COLLECTION ---
            {
                "name": "Margherita Classica",
                "description": "Authentic Naples style pizza with aromatic basil marinara, fresh mozzarella slices, and extra virgin olive oil.",
                "category": "veg",
                "base_price": 299.0,
                "image_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
                "base_id": b_hand.id if b_hand else default_base_id,
                "sauce_id": s_marinara.id if s_marinara else default_sauce_id,
                "cheese_id": c_mozzarella.id if c_mozzarella else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Farmhouse Supreme",
                "description": "Loaded with fresh crunchy capsicum, sweet corn, diced red onions, juicy tomatoes, and golden baked mozzarella.",
                "category": "veg",
                "base_price": 379.0,
                "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
                "base_id": b_hand.id if b_hand else default_base_id,
                "sauce_id": s_marinara.id if s_marinara else default_sauce_id,
                "cheese_id": c_mozzarella.id if c_mozzarella else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Tuscan White Truffle & Mushroom",
                "description": "Creamy garlic alfredo base layered with button mushrooms, wilted spinach, and gourmet four-cheese blend on thin crust.",
                "category": "veg",
                "base_price": 449.0,
                "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
                "base_id": b_thin.id if b_thin else default_base_id,
                "sauce_id": s_alfredo.id if s_alfredo else default_sauce_id,
                "cheese_id": c_four.id if c_four else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Spicy Fiery Diablo",
                "description": "Spicy Arrabbiata sauce base topped with fiery jalapeños, red onions, capsicum, and melted mozzarella on cheese burst crust.",
                "category": "veg",
                "base_price": 429.0,
                "image_url": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80",
                "base_id": b_burst.id if b_burst else default_base_id,
                "sauce_id": s_arrabbiata.id if s_arrabbiata else default_sauce_id,
                "cheese_id": c_mozzarella.id if c_mozzarella else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Pesto Genovese & Black Olive",
                "description": "Fragrant Genovese pesto sauce with sliced black olives, cherry tomatoes, and crumbled Greek feta over hand-tossed dough.",
                "category": "veg",
                "base_price": 399.0,
                "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
                "base_id": b_hand.id if b_hand else default_base_id,
                "sauce_id": s_pesto.id if s_pesto else default_sauce_id,
                "cheese_id": c_feta.id if c_feta else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Paneer Tikka Special",
                "description": "Marinated tandoori paneer cubes, crisp capsicum, diced red onions, and hot chili flakes over spicy sauce.",
                "category": "veg",
                "base_price": 419.0,
                "image_url": "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=600&q=80",
                "base_id": b_hand.id if b_hand else default_base_id,
                "sauce_id": s_arrabbiata.id if s_arrabbiata else default_sauce_id,
                "cheese_id": c_mozzarella.id if c_mozzarella else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Four Cheese Quattro Formaggi",
                "description": "Decadent four-cheese melange of Fior di Latte Mozzarella, aged English Cheddar, Parmesan Reggiano, and Greek Feta.",
                "category": "veg",
                "base_price": 469.0,
                "image_url": "https://images.unsplash.com/photo-1548369937-47519962c11a?auto=format&fit=crop&w=600&q=80",
                "base_id": b_burst.id if b_burst else default_base_id,
                "sauce_id": s_marinara.id if s_marinara else default_sauce_id,
                "cheese_id": c_four.id if c_four else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Florentine Spinach & Sweet Corn",
                "description": "Tender baby spinach leaves, steamed golden corn, creamy alfredo drizzle, and cracked black pepper on sourdough.",
                "category": "veg",
                "base_price": 369.0,
                "image_url": "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80",
                "base_id": b_sourdough.id if b_sourdough else default_base_id,
                "sauce_id": s_alfredo.id if s_alfredo else default_sauce_id,
                "cheese_id": c_mozzarella.id if c_mozzarella else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Mediterranean Sun-Dried Tomato",
                "description": "Rich sun-dried tomatoes, Kalamata black olives, crumbled feta, and fresh oregano over artisanal thin crust.",
                "category": "veg",
                "base_price": 409.0,
                "image_url": "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=600&q=80",
                "base_id": b_thin.id if b_thin else default_base_id,
                "sauce_id": s_marinara.id if s_marinara else default_sauce_id,
                "cheese_id": c_feta.id if c_feta else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Garden Fresh Veggie Delight",
                "description": "Loaded colorful medley of crisp bell peppers, sweet corn, mushrooms, red onions, and Roma tomatoes.",
                "category": "veg",
                "base_price": 349.0,
                "image_url": "https://images.unsplash.com/photo-1564936281291-294551497d81?auto=format&fit=crop&w=600&q=80",
                "base_id": b_wheat.id if b_wheat else default_base_id,
                "sauce_id": s_marinara.id if s_marinara else default_sauce_id,
                "cheese_id": c_mozzarella.id if c_mozzarella else default_cheese_id,
                "is_available": True
            },

            # --- NON-VEG COLLECTION ---
            {
                "name": "Peri Peri Smoked Chicken",
                "description": "Tender pulled chicken tossed in fiery African peri peri glaze with red paprika, onions, and molten mozzarella.",
                "category": "non-veg",
                "base_price": 479.0,
                "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
                "base_id": b_hand.id if b_hand else default_base_id,
                "sauce_id": s_arrabbiata.id if s_arrabbiata else default_sauce_id,
                "cheese_id": c_mozzarella.id if c_mozzarella else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Hickory BBQ Smoked Chicken",
                "description": "Slow-smoked chicken chunks swirled in hickory BBQ glaze, caramelized onions, and sharp cheddar cheese.",
                "category": "non-veg",
                "base_price": 489.0,
                "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
                "base_id": b_thin.id if b_thin else default_base_id,
                "sauce_id": s_bbq.id if s_bbq else default_sauce_id,
                "cheese_id": c_cheddar.id if c_cheddar else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Spicy Chicken Pepperoni Inferno",
                "description": "Double spicy chicken pepperoni slices, pickled jalapeños, crushed chili flakes, and molten cheese burst crust.",
                "category": "non-veg",
                "base_price": 529.0,
                "image_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
                "base_id": b_burst.id if b_burst else default_base_id,
                "sauce_id": s_arrabbiata.id if s_arrabbiata else default_sauce_id,
                "cheese_id": c_mozzarella.id if c_mozzarella else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Butter Chicken Royale",
                "description": "Makhani simmered chicken tikka morsels, fresh coriander, ginger juliennes, and cream drizzle on sourdough.",
                "category": "non-veg",
                "base_price": 499.0,
                "image_url": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80",
                "base_id": b_sourdough.id if b_sourdough else default_base_id,
                "sauce_id": s_marinara.id if s_marinara else default_sauce_id,
                "cheese_id": c_mozzarella.id if c_mozzarella else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Smoked Chicken Sausage Feast",
                "description": "Sliced smoked chicken herb sausages, caramelized bell peppers, onions, and extra stringy mozzarella.",
                "category": "non-veg",
                "base_price": 459.0,
                "image_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
                "base_id": b_hand.id if b_hand else default_base_id,
                "sauce_id": s_marinara.id if s_marinara else default_sauce_id,
                "cheese_id": c_mozzarella.id if c_mozzarella else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Tandoori Chicken Tikka Supreme",
                "description": "Clay-oven roasted spicy chicken tikka, crunchy bell peppers, red onions, and mint yogurt drizzle.",
                "category": "non-veg",
                "base_price": 489.0,
                "image_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
                "base_id": b_hand.id if b_hand else default_base_id,
                "sauce_id": s_arrabbiata.id if s_arrabbiata else default_sauce_id,
                "cheese_id": c_mozzarella.id if c_mozzarella else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Creamy Garlic Alfredo Chicken",
                "description": "Pan-seared herb chicken breast, sliced portobello mushrooms, creamy parmesan alfredo sauce, and fresh thyme.",
                "category": "non-veg",
                "base_price": 519.0,
                "image_url": "https://images.unsplash.com/photo-1548369937-47519962c11a?auto=format&fit=crop&w=600&q=80",
                "base_id": b_thin.id if b_thin else default_base_id,
                "sauce_id": s_alfredo.id if s_alfredo else default_sauce_id,
                "cheese_id": c_parmesan.id if c_parmesan else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Meat Lovers Carnivore Special",
                "description": "Loaded with roasted chicken, spiced chicken meatballs, herb sausages, and smoky BBQ drizzle.",
                "category": "non-veg",
                "base_price": 549.0,
                "image_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
                "base_id": b_burst.id if b_burst else default_base_id,
                "sauce_id": s_bbq.id if s_bbq else default_sauce_id,
                "cheese_id": c_four.id if c_four else default_cheese_id,
                "is_available": True
            },

            # --- SPECIALTY & CHEF SIGNATURE COLLECTION ---
            {
                "name": "Burrata Gold Truffle Masterpiece",
                "description": "Whole artisanal fresh Burrata cheese sphere, shaved black summer truffles, organic arugula, and 24k gold olive drizzle.",
                "category": "specialty",
                "base_price": 649.0,
                "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
                "base_id": b_sourdough.id if b_sourdough else default_base_id,
                "sauce_id": s_pesto.id if s_pesto else default_sauce_id,
                "cheese_id": c_four.id if c_four else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Chef Pizzo Signature Diablo",
                "description": "Chef Pizzo's award-winning secret recipe with triple smoked cheese, charred sweet peppers, hot honey, and ghost pepper spice.",
                "category": "specialty",
                "base_price": 599.0,
                "image_url": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80",
                "base_id": b_burst.id if b_burst else default_base_id,
                "sauce_id": s_arrabbiata.id if s_arrabbiata else default_sauce_id,
                "cheese_id": c_four.id if c_four else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Sicilian Caprese & Sweet Pesto",
                "description": "Fresh buffalo mozzarella rounds, heirloom cherry tomatoes, sweet Genovese pesto swirl, and aged balsamic glaze.",
                "category": "specialty",
                "base_price": 499.0,
                "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
                "base_id": b_thin.id if b_thin else default_base_id,
                "sauce_id": s_pesto.id if s_pesto else default_sauce_id,
                "cheese_id": c_mozzarella.id if c_mozzarella else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Smoky Honey & Goat Cheese",
                "description": "Creamy goat cheese crumbles, caramelized red onions, crushed walnuts, and chili infused organic wildflower honey.",
                "category": "specialty",
                "base_price": 529.0,
                "image_url": "https://images.unsplash.com/photo-1548369937-47519962c11a?auto=format&fit=crop&w=600&q=80",
                "base_id": b_sourdough.id if b_sourdough else default_base_id,
                "sauce_id": s_alfredo.id if s_alfredo else default_sauce_id,
                "cheese_id": c_feta.id if c_feta else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Napoli Garlic Butter Crust",
                "description": "Whole roasted garlic cloves, rosemary infused olive oil, San Marzano marinara, and aged parmesan crust.",
                "category": "specialty",
                "base_price": 439.0,
                "image_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
                "base_id": b_sourdough.id if b_sourdough else default_base_id,
                "sauce_id": s_marinara.id if s_marinara else default_sauce_id,
                "cheese_id": c_parmesan.id if c_parmesan else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Avocado Garden & Herb Crisp",
                "description": "Sliced ripe Hass avocados, cherry tomatoes, baby arugula, cold pressed extra virgin oil, and lemon zest on thin base.",
                "category": "specialty",
                "base_price": 479.0,
                "image_url": "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80",
                "base_id": b_thin.id if b_thin else default_base_id,
                "sauce_id": s_pesto.id if s_pesto else default_sauce_id,
                "cheese_id": c_feta.id if c_feta else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Spicy Peri Peri Paneer Burst",
                "description": "Peri peri marinated cottage cheese cubes, sweet corn, spicy jalapeño rounds, and double molten cheese explosion.",
                "category": "specialty",
                "base_price": 489.0,
                "image_url": "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=600&q=80",
                "base_id": b_burst.id if b_burst else default_base_id,
                "sauce_id": s_arrabbiata.id if s_arrabbiata else default_sauce_id,
                "cheese_id": c_four.id if c_four else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Firecracker Ghost Pepper Extreme",
                "description": "Extreme spicy warning! Ghost pepper infused tomato sauce, Carolina Reaper flakes, jalapeños, and soothing cheddar.",
                "category": "specialty",
                "base_price": 539.0,
                "image_url": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80",
                "base_id": b_burst.id if b_burst else default_base_id,
                "sauce_id": s_arrabbiata.id if s_arrabbiata else default_sauce_id,
                "cheese_id": c_cheddar.id if c_cheddar else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Portobello & Wild Mushroom Truffle",
                "description": "Wild forest mushrooms, porcini extract, caramelized garlic, fresh rosemary, and grated Parmesan Reggiano.",
                "category": "specialty",
                "base_price": 529.0,
                "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
                "base_id": b_thin.id if b_thin else default_base_id,
                "sauce_id": s_alfredo.id if s_alfredo else default_sauce_id,
                "cheese_id": c_parmesan.id if c_parmesan else default_cheese_id,
                "is_available": True
            },
            {
                "name": "Grand Royale 5-Star Gourmet",
                "description": "The crowning jewel: slow fermented sourdough base, smoked barbecue sauce, 4 artisan cheeses, and chef's daily spice blend.",
                "category": "specialty",
                "base_price": 699.0,
                "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
                "base_id": b_sourdough.id if b_sourdough else default_base_id,
                "sauce_id": s_bbq.id if s_bbq else default_sauce_id,
                "cheese_id": c_four.id if c_four else default_cheese_id,
                "is_available": True
            }
        ]

        # Upsert pizzas cleanly
        existing_pizzas = {p.name: p for p in db.query(Pizza).all()}
        added_count = 0
        updated_count = 0

        for p_data in expanded_pizzas:
            name = p_data["name"]
            if name in existing_pizzas:
                existing = existing_pizzas[name]
                existing.description = p_data["description"]
                existing.category = p_data["category"]
                existing.base_price = p_data["base_price"]
                existing.image_url = p_data["image_url"]
                existing.is_available = True
                updated_count += 1
            else:
                db.add(Pizza(**p_data))
                added_count += 1

        db.commit()
        total_pizzas = db.query(Pizza).filter(Pizza.is_available == True).count()
        print(f"Successfully seeded expanded menu: {added_count} added, {updated_count} updated. Total active pizzas in DB: {total_pizzas}")

    except Exception as e:
        db.rollback()
        print(f"Error seeding expanded pizzas: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_expanded_pizzas()
