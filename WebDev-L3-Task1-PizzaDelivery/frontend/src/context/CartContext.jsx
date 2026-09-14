import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('pizzahub_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pizzahub_cart', JSON.stringify(items));
  }, [items]);

  const addStandardPizza = (pizza, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => !i.is_custom && i.pizza_id === pizza.id
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          id: `std_${pizza.id}_${Date.now()}`,
          pizza_id: pizza.id,
          pizza_name: pizza.name,
          unit_price: pizza.base_price,
          quantity: quantity,
          is_custom: false,
          image_url: pizza.image_url,
          customization: null,
        },
      ];
    });
  };

  const addCustomPizza = (customPizzaData) => {
    setItems((prev) => [
      ...prev,
      {
        id: `custom_${Date.now()}_${Math.random()}`,
        pizza_id: null,
        pizza_name: customPizzaData.pizza_name,
        unit_price: customPizzaData.unit_price,
        quantity: customPizzaData.quantity || 1,
        is_custom: true,
        customization: customPizzaData.customization,
        custom_details: customPizzaData.custom_details,
      },
    ]);
  };

  const updateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeItem = (itemId) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
  const deliveryFee = subtotal > 0 ? (subtotal < 500 ? 40 : 0) : 0;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

  return (
    <CartContext.Provider
      value={{
        items,
        addStandardPizza,
        addCustomPizza,
        updateQuantity,
        removeItem,
        clearCart,
        totalItemsCount,
        subtotal,
        deliveryFee,
        tax,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
