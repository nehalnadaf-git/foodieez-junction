# Foodieez Junction - Complete Instruction Manual

## 1. What is Foodieez Junction?
Foodieez Junction is a modern, full-featured web application designed to revolutionize the dining experience for both customers and restaurant administrators. It acts as both a **Digital Menu & Ordering Platform** for users and a **Comprehensive Command Center** for the restaurant staff. Built using Next.js and powered by a real-time Convex backend, it delivers lightning-fast performance, real-time syncing, and a premium visual aesthetic.

---

## 2. What is the Problem?
Operating a modern restaurant or street food junction using traditional methods presents several challenges:
- **Inefficient Ordering:** Waiters taking manual orders can lead to miscommunications, delayed service, and a poor customer experience during peak hours.
- **Static Menus:** Printed menus become outdated instantly. If an item runs out of stock or prices change, there is no easy way to notify customers in real time.
- **Operational Chaos:** Managing live orders, tracking which order goes to which table, handling takeaways, and calculating payments can easily become overwhelming for the staff.
- **Missed Marketing Opportunities:** Without a digital presence, it is hard to instantly push out daily offers, highlight special items, or gather and display customer reviews to build trust.

---

## 3. What is the Solution?
Foodieez Junction solves these problems by fully digitizing the core restaurant workflow:
- **For the Customer:** A highly responsive, mobile-first Web App. Customers can browse an always-up-to-date visual menu, apply offers, select portion sizes, and place orders directly from their table (or for takeaway) seamlessly.
- **For the Restaurant:** A powerful, real-time Admin Panel. Staff can manage incoming orders, instantly mark items as "out of stock," update prices, create promotional offers, and manage table statuses, all from a centralized, secure dashboard.

---

## 4. How the Ordering System Works (Start to End)
The ordering system is designed to be frictionless for the customer and instantly manageable for the staff. Here is the complete flow of an order from the moment a customer sits down to the moment they finish eating:

**Step 1: Accessing the Menu**
- **Dine-in Customers:** The customer scans a physical QR code placed on their specific table. The QR code contains their table number embedded in the link (e.g., `?table=T1`). The system automatically reads this parameter and saves the table number to streamline their checkout later.
- **Takeaway Customers:** The customer visits the website link directly via social media, Google, or by typing the URL.

**Step 2: Browsing & Selection**
- The customer scrolls through the visually appealing digital menu, which is organized by **Categories** (e.g., Starters, Main Course, Beverages).
- They only see items that are currently **"In Stock"** (controlled directly by the Admin Panel).
- Customers can view specific tags (like "BOGO", "New", "10% Off") and dietary indicators (Veg/Non-Veg).
- When a customer taps on an item, they can select a specific **Size** (e.g., Full, Half) if applicable, and increase or decrease the **Quantity**.
- Tapping **"Add to Cart"** instantly adds the item to their digital cart. A floating cart icon updates at the bottom of the screen showing the total amount and number of items.

**Step 3: Cart Review**
- The customer taps the floating cart button to open the **Cart Drawer** (a panel sliding in from the bottom or side).
- Inside the cart, they can review their selected items, adjust quantities, or remove items.
- The system automatically calculates the total price based on the sizes chosen.
- Clicking **"Checkout"** or **"Place Order"** opens the final Order Modal.

**Step 4: The Checkout Process (Order Modal)**
- **Order Type:** The customer must choose between **"Dine-in"** and **"Takeaway"**.
  - If Dine-in, the system asks for a Table Number. If they scanned a QR code, the Table Number is already filled in automatically!
  - If Takeaway, they just enter their Name and optionally special instructions.
- **Special Instructions:** A text box allows the customer to type requests like "Make it spicy," "No onions," or "Extra sauce."
- **Payment Method:** The customer selects either **"Cash"** (to pay at the counter/table) or **"UPI"**.
  - If "UPI" is selected, the system can display the restaurant's active UPI details/QR code (configured in the Admin Panel) for seamless digital payment.
- The customer submits the order.

**Step 5: Backend Real-Time Sync (Convex & WhatsApp)**
- As soon as the customer clicks submit, two things happen instantly:
  1. **Database Sync:** The order is pushed directly into the real-time **Convex Database**. 
  2. **WhatsApp Notification (Optional):** The system generates a formatted WhatsApp message summarizing the entire order (Items, Quantities, Table Number, Total Amount), ensuring the staff receives a ping on their phone immediately as a backup.

**Step 6: Admin Panel Management (Restaurant Side)**
- The restaurant staff has the **Admin Panel - Live Orders** tab open on a tablet or computer at the counter/kitchen.
- A new order card instantly pops up in the **"Pending"** column with a notification sound/alert.
- The order card displays all critical info: Customer Name, Order Type (Table # or Takeaway), Items, Special Instructions, and Payment status.

**Step 7: Order Fulfillment workflow**
- **Action 1 (Accepting):** The staff clicks **"Accept"** or **"Start Preparing."** The order moves to the **"Preparing"** column. This tells everyone in the kitchen that the order is being worked on.
- **Action 2 (Fulfillment):** The chef looks at the digital ticket, prepares the food, and follows the special instructions.
- **Action 3 (Completion):** Once the food is served to the table or handed over for takeaway, the staff clicks **"Complete"** on the admin panel. The order is moved to the final **"Completed"** column and recorded in the daily sales data.
- **Cancellation:** If an item is unavailable or the customer requests a cancellation, the staff can cancel the order directly, removing it from the active queue.

---

## 5. Features of the Website (Customer Facing)
The public website is tailored for an exceptional, premium user experience:

- **Beautiful Hero/Landing Section:** A visually striking introduction that showcases the restaurant's brand, current promotions, and operational status.
- **Interactive, Live Menu:** Browse items neatly grouped into Categories. Only available items are shown. Features bold veg/non-veg indicators and clear pricing.
- **Dynamic Portion Sizing:** Support for multiple sizes per item (e.g., Half/Full, Small/Large) so customers know exactly what they are paying for.
- **Floating Cart & Slide-out Drawer:** A non-intrusive floating cart button that tracks total items. Clicking it slides out a detailed cart drawer to review orders before checkout.
- **Offers & Badges:** Items dynamically display beautiful badges highlighting deals like "BOGO" (Buy 1 Get 1), percentage discounts, or "New" tags.
- **Customer Reviews Section:** A dedicated area displaying verified, admin-approved testimonials from past diners to build trust and credibility.
- **Table Parameters Sync:** Automatically detects which table the customer is sitting at via URL parameters to speed up the order checkout process.
- **Premium UI / Dark Mode:** Incorporates smooth scrolling, glassmorphism UI elements, engaging micro-animations, and full mobile optimization.

---

## 6. Features of the Admin Panel (Restaurant Staff)
The secure Admin Panel provides complete control over the application's data and operations:

- **Live Orders Dashboard:** A real-time kanban or list interface. New orders pop up instantly. Staff can change order statuses (Pending → Preparing → Completed/Cancelled) with a click.
- **Quick Availability Management:** A rapid-action menu allowing staff to instantly toggle items "Out of Stock" or "In Stock." This directly hides/shows items on the public menu without needing to edit the entire database record.
- **Advanced Menu Management:** Add, edit, or delete categories and food items. Upload vivid images, configure pricing, manage sizes, and add item descriptions.
- **Table Management:** Create, name, and sequence physical tables. Helps in generating specific QR codes and tracking dine-in orders efficiently.
- **Offers & Discounts Module:** Easily create global or item-specific offers. Apply percentage cuts or promotional badges to drive more sales on specific days.
- **UPI & Payment Configuration:** Manage the active restaurant UPI ID and payment instructions to facilitate smooth digital payments for takeaway or dine-in customers.
- **Review Moderation:** Read incoming customer feedback. Staff can choose to "Approve", "Hide", or "Pin" specific top reviews to show on the public landing page.
- **Global Settings & Override:** Toggle the global "Open/Closed" status of the restaurant. If checking out is disabled during offline hours, staff can configure exactly what "Closed Message" the customers will see.

---

## 7. Summary of Settings & Options
Within the platform, the administration has deep control options:
- **Visibility Toggles:** Hide entire categories or individual items temporarily without deleting them.
- **Order Settings:** Enable or disable specific types of orders (e.g., turn off Takeaway during busy hours).
- **Social Links Management:** Update Instagram, Facebook, or WhatsApp links dynamically without code changes.
- **Manual Overrides:** The ability to instantly pause all incoming digital orders in case the kitchen is overwhelmed. 

*This manual provides an overview of the capabilities present out-of-the-box for Foodieez Junction, maximizing efficiency for the business and delight for the customer.*
