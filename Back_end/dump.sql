--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: thesizzledmunch
--

INSERT INTO public.admin_users (id, username, email, password_hash) VALUES (1, 'Admin', 'superuser@gmail.com', 'scrypt:32768:8:1$tk3ofIJK8qapnYEZ$175f9d05dad22a8ec844401e719931e59dd1c9f112fcafb367736d347f69cc62993c384d8c371ddeb3ec7c32eb88662c389ec9eb438334f938ceacc7f983b280');


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: thesizzledmunch
--

INSERT INTO public.alembic_version (version_num) VALUES ('c839e3ada549');


--
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: thesizzledmunch
--

INSERT INTO public.menu_items (id, item_name, category, price, description, image_url, extras) VALUES (1, 'Classic Beef Burger', 'Burgers', 700.00, 'Buns, Beef Patty, Onions, Tomatoes, Cheddar cheese, Ketchup, Mayonnaise, Mustard aioli, Lettuce, Bacon, Egg.', '/images/Classic American Burger with Fried Egg.jpeg', NULL);
INSERT INTO public.menu_items (id, item_name, category, price, description, image_url, extras) VALUES (2, 'Classic Double Beef Burger', 'Burgers', 800.00, 'Buns, Aged Beef Patty (2), Onions, Tomatoes, Cheddar cheese, Ketchup, Mayonnaise, Mustard aioli, Lettuce, Bacon, Egg.', '/images/Double Bacon Cheeseburger – High Protein.jpeg', NULL);
INSERT INTO public.menu_items (id, item_name, category, price, description, image_url, extras) VALUES (3, 'Chicken Burger', 'Burgers', 750.00, 'Buns, Marinated Chicken Breast, Caramelized Onions, Tomatoes, Cheddar cheese, Ketchup aioli, Garlic aioli, Mustard aioli, Lettuce, Egg.', '/images/Burger Taste.jpeg', NULL);
INSERT INTO public.menu_items (id, item_name, category, price, description, image_url, extras) VALUES (4, 'Double Chicken Burger', 'Burgers', 950.00, 'Buns, Marinated Chicken Breast 200g, Caramelized Onions, Tomatoes, Cheddar cheese, Ketchup aioli, Garlic aioli, Coleslaw, Lettuce, Egg.', '/images/Fried Chicken Burger.jpeg', NULL);
INSERT INTO public.menu_items (id, item_name, category, price, description, image_url, extras) VALUES (5, 'Pepperoni Pizza', 'Pizzas', 1200.00, 'Classic tomato sauce, mozzarella cheese, spicy pepperoni slices, and oregano.', '/images/pepperoni.jpeg', NULL);
INSERT INTO public.menu_items (id, item_name, category, price, description, image_url, extras) VALUES (6, 'Margherita Pizza', 'Pizzas', 1000.00, 'Tomato base, fresh mozzarella, basil, and olive oil drizzle.', '/images/Margherita.jpeg', NULL);
INSERT INTO public.menu_items (id, item_name, category, price, description, image_url, extras) VALUES (7, 'Coke', 'Drinks', 200.00, 'Chilled 350ml carbonated cola beverage.', '/images/coke.jpeg', NULL);
INSERT INTO public.menu_items (id, item_name, category, price, description, image_url, extras) VALUES (8, 'Mango Smoothie', 'Drinks', 350.00, 'Fresh mango puree blended with yogurt and honey.', '/images/mango.jpeg', NULL);
INSERT INTO public.menu_items (id, item_name, category, price, description, image_url, extras) VALUES (9, 'Chocolate Brownie', 'Desserts', 300.00, 'Rich and fudgy brownie with melted chocolate chips.', '/images/Brownies.jpeg', NULL);
INSERT INTO public.menu_items (id, item_name, category, price, description, image_url, extras) VALUES (10, 'New York Cheesecake', 'Desserts', 400.00, 'Creamy cheesecake with a graham cracker crust and strawberry topping.', '/images/cheesecake.jpeg', NULL);
INSERT INTO public.menu_items (id, item_name, category, price, description, image_url, extras) VALUES (11, 'Vanilla Milkshake', 'Drinks', 300.00, 'Creamy vanilla milkshake blended with whole milk, vanilla ice cream, and topped with whipped cream.', '/images/Vanilla-milkshake.jpeg', NULL);
INSERT INTO public.menu_items (id, item_name, category, price, description, image_url, extras) VALUES (12, 'Fanta Orange', 'Drinks', 200.00, 'Chilled 350ml carbonated orange-flavored soda.', '/images/fanta.jpeg', NULL);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: thesizzledmunch
--

INSERT INTO public.users (id, username, email, password_hash, delivery_address, phone_number, profile_image, verification_code, verification_code_sent_at, is_password_reset_pending, is_admin, is_online, last_login_at, force_logout) VALUES (18, 'Neema', 'mawia9301@gmail.com', 'scrypt:32768:8:1$B33LEtNlqBIRjivV$bea2c309a3550decbdb91997e1317b73b705f1839533567619e303f8a0c3ac39dc91e1eda09359fb6de9b6ce62e5a3abf652e103f9605c8f224542c5aca63e69', 'Nairobi', '070000010000', '', 'J9FHN4', '2025-07-05 19:40:09.337052', NULL, false, true, '2025-07-08 16:12:05.859652', true);
INSERT INTO public.users (id, username, email, password_hash, delivery_address, phone_number, profile_image, verification_code, verification_code_sent_at, is_password_reset_pending, is_admin, is_online, last_login_at, force_logout) VALUES (1, 'Admin', 'superuser@gmail.com', 'scrypt:32768:8:1$tk3ofIJK8qapnYEZ$175f9d05dad22a8ec844401e719931e59dd1c9f112fcafb367736d347f69cc62993c384d8c371ddeb3ec7c32eb88662c389ec9eb438334f938ceacc7f983b280', NULL, NULL, 'https://ui-avatars.com/api/?name=John+Doe&background=random&rounded=true', NULL, NULL, NULL, true, true, NULL, NULL);
INSERT INTO public.users (id, username, email, password_hash, delivery_address, phone_number, profile_image, verification_code, verification_code_sent_at, is_password_reset_pending, is_admin, is_online, last_login_at, force_logout) VALUES (19, 'joe ken', 'joekentafir1@gmail.com', 'scrypt:32768:8:1$Y5VNNKw2pARiA0OV$c52c3518ddec19c9a5fb7b5ee33bbf34ce8c16fe8f86cce3972474c875b8040661b890d58ea5d3be6d55647f3e9a48de3eeadb202c7f2e16eca2804ebadfbcfd', NULL, NULL, NULL, NULL, NULL, false, false, true, '2025-07-09 19:17:05.743882', false);
INSERT INTO public.users (id, username, email, password_hash, delivery_address, phone_number, profile_image, verification_code, verification_code_sent_at, is_password_reset_pending, is_admin, is_online, last_login_at, force_logout) VALUES (13, 'Kim', 'kim@gmail.com', 'scrypt:32768:8:1$7e0P25hnWyJI4Zk3$9c2f7dbf1dc330335cd587f80b5f907cf49a764b3b5d11d90b6a477ff2b152bf6233a97611e4b1758280f4c1af35979d0257e1ad8a3355c4db0eca0a70b33754', 'Nairobi', '0722355647', 'https://ui-avatars.com/api/?name=Jane+Doe&background=random', NULL, NULL, NULL, false, true, '2025-07-08 06:21:22.518994', true);


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: thesizzledmunch
--



--
-- Data for Name: cart_summaries; Type: TABLE DATA; Schema: public; Owner: thesizzledmunch
--

INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (7, 13, 900.00, 122.00, 15.00, 900.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (8, 13, 1950.00, 264.00, 33.00, 1950.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (9, 13, 2350.00, 319.00, 40.00, 2350.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (10, 13, 2350.00, 319.00, 40.00, 2350.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (11, 13, 2350.00, 319.00, 40.00, 2350.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (12, 13, 2350.00, 319.00, 40.00, 2350.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (13, 13, 2350.00, 319.00, 40.00, 2350.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (14, 13, 2350.00, 319.00, 40.00, 2350.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (15, 13, 2350.00, 319.00, 40.00, 2350.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (16, 13, 2350.00, 319.00, 40.00, 2350.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (17, 13, 2350.00, 319.00, 40.00, 2350.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (18, 13, 2350.00, 319.00, 40.00, 2350.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (19, 13, 3000.00, 407.00, 51.00, 3000.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (20, 13, 3100.00, 420.00, 53.00, 3100.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (21, 13, 1550.00, 210.00, 26.00, 1550.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (22, 13, 700.00, 95.00, 12.00, 700.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (24, 13, 1800.00, 244.00, 31.00, 1800.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (25, 13, 1700.00, 231.00, 29.00, 1700.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (26, 13, 3500.00, 475.00, 59.00, 3500.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (28, 13, 300.00, 41.00, 5.00, 300.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (30, 13, 400.00, 54.00, 7.00, 400.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (31, 13, 950.00, 129.00, 16.00, 950.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (61, 13, 3150.00, 427.00, 53.00, 3150.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (62, 13, 500.00, 68.00, 8.00, 500.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (63, 13, 750.00, 102.00, 13.00, 750.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (64, 13, 800.00, 108.00, 14.00, 800.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (65, 13, 750.00, 102.00, 13.00, 750.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (66, 13, 350.00, 47.00, 6.00, 350.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (67, 13, 1550.00, 210.00, 26.00, 1550.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (68, 13, 750.00, 102.00, 13.00, 750.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (69, 13, 800.00, 108.00, 14.00, 800.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (70, 13, 2650.00, 359.00, 45.00, 2650.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (71, 13, 2450.00, 332.00, 42.00, 2450.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (72, 13, 950.00, 129.00, 16.00, 950.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (73, 13, 800.00, 108.00, 14.00, 800.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (74, 13, 1600.00, 217.00, 27.00, 1600.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (75, 13, 1500.00, 203.00, 25.00, 1500.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (76, 13, 950.00, 129.00, 16.00, 950.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (77, 13, 1500.00, 203.00, 25.00, 1500.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (78, 13, 650.00, 88.00, 11.00, 650.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (79, 13, 1500.00, 203.00, 25.00, 1500.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (80, 13, 200.00, 27.00, 3.00, 200.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (81, 13, 300.00, 41.00, 5.00, 300.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (82, 13, 750.00, 102.00, 13.00, 750.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (83, 13, 1000.00, 136.00, 17.00, 1000.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (84, 13, 1200.00, 163.00, 20.00, 1200.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (85, 13, 750.00, 102.00, 13.00, 750.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (86, 13, 1150.00, 156.00, 19.00, 1150.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (87, 13, 2450.00, 332.00, 42.00, 2450.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (88, 13, 800.00, 108.00, 14.00, 800.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (89, 13, 350.00, 47.00, 6.00, 350.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (90, 13, 1000.00, 136.00, 17.00, 1000.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (91, 18, 1600.00, 217.00, 27.00, 1600.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (92, 13, 4300.00, 583.00, 73.00, 4300.00);
INSERT INTO public.cart_summaries (id, user_id, subtotal, vat, ctl, total) VALUES (93, 19, 1550.00, 210.00, 26.00, 1550.00);


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: thesizzledmunch
--

INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (20, 13, 'Completed', 950.00, '2025-07-04 18:27:02.771761', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (19, 13, 'Completed', 400.00, '2025-07-04 18:25:38.722099', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (10, 13, 'Completed', 1550.00, '2025-07-04 15:19:11.206146', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (11, 13, 'Completed', 700.00, '2025-07-04 15:28:52.056091', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (13, 13, 'Completed', 1800.00, '2025-07-04 16:09:45.161306', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (17, 13, 'Completed', 300.00, '2025-07-04 17:55:33.589779', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (15, 13, 'Completed', 3500.00, '2025-07-04 17:24:20.457089', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (14, 13, 'Completed', 1700.00, '2025-07-04 16:36:08.520748', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (30, 13, 'Completed', 750.00, '2025-07-05 23:36:18.35684', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (28, 13, 'Completed', 750.00, '2025-07-05 23:23:01.651815', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (52, 13, 'Completed', 200.00, '2025-07-07 15:10:07.063662', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (53, 13, 'Completed', 300.00, '2025-07-07 15:47:16.564345', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (46, 13, 'Completed', 1600.00, '2025-07-06 19:55:40.936212', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (44, 13, 'Completed', 950.00, '2025-07-06 19:48:25.657099', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (47, 13, 'Completed', 1500.00, '2025-07-07 02:41:17.260891', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (32, 13, 'Completed', 1550.00, '2025-07-05 21:03:52.012695', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (31, 13, 'Completed', 350.00, '2025-07-05 20:52:40.42753', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (26, 13, 'Completed', 3150.00, '2025-07-05 23:06:03.157422', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (27, 13, 'Completed', 500.00, '2025-07-05 23:16:02.966549', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (29, 13, 'Completed', 800.00, '2025-07-05 23:25:26.129439', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (40, 13, 'Completed', 950.00, '2025-07-06 19:45:19.849604', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (39, 13, 'Completed', 950.00, '2025-07-06 19:45:19.675662', false, false);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (33, 13, 'Completed', 750.00, '2025-07-05 21:21:03.449137', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (34, 13, 'Completed', 800.00, '2025-07-05 21:23:00.549651', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (35, 13, 'Completed', 2650.00, '2025-07-06 18:49:10.606664', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (63, 18, 'Completed', 1600.00, '2025-07-08 01:52:49.979558', false, false);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (36, 13, 'Completed', 2450.00, '2025-07-06 19:21:40.463453', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (54, 13, 'Completed', 750.00, '2025-07-07 15:52:02.253146', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (64, 13, 'Completed', 4300.00, '2025-07-08 07:38:07.894858', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (65, 19, 'Preparing', 3300.00, '2025-07-08 08:11:20.860053', false, false);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (67, 19, 'Pending', 1700.00, '2025-07-08 08:27:36.853548', false, false);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (68, 19, 'Ready', 200.00, '2025-07-08 08:42:01.059365', false, false);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (69, 19, 'Pending', 1500.00, '2025-07-08 09:03:22.215258', false, false);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (66, 19, 'Preparing', 1500.00, '2025-07-08 08:16:13.215447', false, false);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (70, 19, 'Pending', 1500.00, '2025-07-08 09:10:46.698151', false, false);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (71, 18, 'Pending', 1200.00, '2025-07-08 16:13:22.8732', false, false);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (61, 13, 'Completed', 350.00, '2025-07-07 16:37:45.900131', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (60, 13, 'Completed', 800.00, '2025-07-07 16:36:50.327528', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (38, 13, 'Completed', 950.00, '2025-07-06 19:45:19.446854', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (37, 13, 'Completed', 950.00, '2025-07-06 19:45:18.476499', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (41, 13, 'Completed', 950.00, '2025-07-06 19:45:20.075258', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (43, 13, 'Completed', 950.00, '2025-07-06 19:45:20.695389', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (42, 13, 'Completed', 950.00, '2025-07-06 19:45:20.565584', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (45, 13, 'Completed', 800.00, '2025-07-06 19:52:58.858862', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (50, 13, 'Completed', 650.00, '2025-07-07 15:00:51.913438', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (51, 13, 'Completed', 1500.00, '2025-07-07 15:08:30.250453', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (48, 13, 'Completed', 950.00, '2025-07-07 02:42:43.570411', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (49, 13, 'Completed', 1500.00, '2025-07-07 14:53:16.451309', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (62, 13, 'Completed', 1000.00, '2025-07-07 18:19:06.378475', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (59, 13, 'Completed', 2450.00, '2025-07-07 16:25:42.126698', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (58, 13, 'Completed', 1150.00, '2025-07-07 16:18:07.115962', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (57, 13, 'Completed', 750.00, '2025-07-07 16:08:29.274069', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (56, 13, 'Completed', 1200.00, '2025-07-07 16:00:58.830147', true, true);
INSERT INTO public.orders (id, user_id, status, total_amount, created_at, user_confirmed, admin_confirmed) VALUES (55, 13, 'Completed', 1000.00, '2025-07-07 15:58:09.011258', true, true);


--
-- Data for Name: mpesa_payments; Type: TABLE DATA; Schema: public; Owner: thesizzledmunch
--

INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (2, '254708374149', 650.00, 'ws_CO_07072025180034153708374149', 'Pending', '{"MerchantRequestID": "3ac5-4c88-8708-9bd2f5b3e98d97903", "CheckoutRequestID": "ws_CO_07072025180034153708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 15:00:36.280124', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (3, '254708374149', 1500.00, 'ws_CO_07072025180823223708374149', 'Pending', '{"MerchantRequestID": "25fe-4f8a-9a66-d5cbb202bfb4106192", "CheckoutRequestID": "ws_CO_07072025180823223708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 15:08:25.632742', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (4, '254708374149', 200.00, 'ws_CO_07072025180953944708374149', 'Pending', '{"MerchantRequestID": "a1c2-4262-a355-09d79b6827da106543", "CheckoutRequestID": "ws_CO_07072025180953944708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 15:09:56.669828', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (1, '254708374149', 1500.00, 'ws_CO_07072025175310062708374149', 'Success', '{"Body": {"stkCallback": {"MerchantRequestID": "12345", "CheckoutRequestID": "ws_CO_07072025175310062708374149", "ResultCode": 0, "ResultDesc": "The service request is processed successfully.", "CallbackMetadata": {"Item": [{"Name": "Amount", "Value": 1500}, {"Name": "MpesaReceiptNumber", "Value": "ABC123XYZ"}, {"Name": "TransactionDate", "Value": 20250707153000}, {"Name": "PhoneNumber", "Value": 254708374149}]}}}}', '2025-07-07 14:53:12.132454', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (5, '254708374149', 1500.00, 'ws_CO_07072025184337623708374149', 'Pending', '{"MerchantRequestID": "f6a3-4572-827b-812b56a9b4b97299", "CheckoutRequestID": "ws_CO_07072025184337623708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 15:43:40.11953', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (6, '254708374149', 50.00, 'ws_CO_07072025184348860708374149', 'Pending', '{"MerchantRequestID": "a1c2-4262-a355-09d79b6827da107075", "CheckoutRequestID": "ws_CO_07072025184348860708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 15:43:51.578687', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (7, '254708374149', 300.00, 'ws_CO_07072025184911601708374149', 'Pending', '{"MerchantRequestID": "3ac5-4c88-8708-9bd2f5b3e98d98766", "CheckoutRequestID": "ws_CO_07072025184911601708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 15:46:50.32621', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (8, '254708374149', 750.00, 'ws_CO_07072025185412218708374149', 'Pending', '{"MerchantRequestID": "a1c2-4262-a355-09d79b6827da107295", "CheckoutRequestID": "ws_CO_07072025185412218708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 15:51:51.12145', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (9, '254708374149', 1000.00, 'ws_CO_07072025185804515708374149', 'Pending', '{"MerchantRequestID": "f6a3-4572-827b-812b56a9b4b97585", "CheckoutRequestID": "ws_CO_07072025185804515708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 15:58:08.922265', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (10, '254708374149', 1200.00, 'ws_CO_07072025190056282708374149', 'Pending', '{"MerchantRequestID": "61fa-4c2c-b3db-088b7d2b6ffc97970", "CheckoutRequestID": "ws_CO_07072025190056282708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 16:00:58.751703', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (11, '254708374149', 750.00, 'ws_CO_07072025191049887708374149', 'Pending', '{"MerchantRequestID": "25fe-4f8a-9a66-d5cbb202bfb4107254", "CheckoutRequestID": "ws_CO_07072025191049887708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 16:08:29.189681', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (12, '254708374149', 1150.00, 'ws_CO_07072025191803759708374149', 'Pending', '{"MerchantRequestID": "f6a3-4572-827b-812b56a9b4b98052", "CheckoutRequestID": "ws_CO_07072025191803759708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 16:18:06.906872', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (13, '254708374149', 2450.00, 'ws_CO_07072025192802910708374149', 'Pending', '{"MerchantRequestID": "25fe-4f8a-9a66-d5cbb202bfb4107687", "CheckoutRequestID": "ws_CO_07072025192802910708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 16:25:41.906169', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (14, '254708374149', 800.00, 'ws_CO_07072025193725022708374149', 'Pending', '{"MerchantRequestID": "c5e5-4c99-8aec-84c700cd04ff98702", "CheckoutRequestID": "ws_CO_07072025193725022708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 16:35:03.7884', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (15, '254708374149', 350.00, 'ws_CO_07072025194001649708374149', 'Pending', '{"MerchantRequestID": "25fe-4f8a-9a66-d5cbb202bfb4107825", "CheckoutRequestID": "ws_CO_07072025194001649708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 16:37:40.661663', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (16, '254708374149', 800.00, 'ws_CO_07072025194651039708374149', 'Pending', '{"MerchantRequestID": "a1c2-4262-a355-09d79b6827da108209", "CheckoutRequestID": "ws_CO_07072025194651039708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 16:44:30.211681', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (17, '254708374149', 800.00, 'ws_CO_07072025194719652708374149', 'Pending', '{"MerchantRequestID": "c5e5-4c99-8aec-84c700cd04ff98917", "CheckoutRequestID": "ws_CO_07072025194719652708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 16:47:22.268153', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (18, '254708374149', 800.00, 'ws_CO_07072025194847697708374149', 'Pending', '{"MerchantRequestID": "c5e5-4c99-8aec-84c700cd04ff98930", "CheckoutRequestID": "ws_CO_07072025194847697708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 16:48:50.342611', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (19, '254708374149', 800.00, 'ws_CO_07072025195250423708374149', 'Pending', '{"MerchantRequestID": "f6a3-4572-827b-812b56a9b4b98603", "CheckoutRequestID": "ws_CO_07072025195250423708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 16:50:29.214803', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (20, '254708374149', 800.00, 'ws_CO_07072025195716323708374149', 'Pending', '{"MerchantRequestID": "c5e5-4c99-8aec-84c700cd04ff98990", "CheckoutRequestID": "ws_CO_07072025195716323708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 16:54:55.403282', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (21, '254708374149', 1550.00, 'ws_CO_07072025200423309708374149', 'Pending', '{"MerchantRequestID": "c5e5-4c99-8aec-84c700cd04ff99107", "CheckoutRequestID": "ws_CO_07072025200423309708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 17:02:02.729232', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (22, '254708374149', 1550.00, 'ws_CO_07072025200521256708374149', 'Pending', '{"MerchantRequestID": "c5e5-4c99-8aec-84c700cd04ff99190", "CheckoutRequestID": "ws_CO_07072025200521256708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 17:05:23.852922', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (23, '254708374149', 1550.00, 'ws_CO_07072025200955895708374149', 'Pending', '{"MerchantRequestID": "3ac5-4c88-8708-9bd2f5b3e98d100155", "CheckoutRequestID": "ws_CO_07072025200955895708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 17:10:00.068831', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (24, '254708374149', 1550.00, 'ws_CO_07072025202631478708374149', 'Pending', '{"MerchantRequestID": "61fa-4c2c-b3db-088b7d2b6ffc99326", "CheckoutRequestID": "ws_CO_07072025202631478708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 17:24:10.522872', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (25, '254708374149', 1550.00, 'ws_CO_07072025202859136708374149', 'Pending', '{"MerchantRequestID": "3ac5-4c88-8708-9bd2f5b3e98d100385", "CheckoutRequestID": "ws_CO_07072025202859136708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 17:26:37.913448', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (26, '254708374149', 1550.00, 'ws_CO_07072025203654182708374149', 'Pending', '{"MerchantRequestID": "c5e5-4c99-8aec-84c700cd04ff99582", "CheckoutRequestID": "ws_CO_07072025203654182708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 17:36:56.766975', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (27, '254708374149', 1550.00, 'ws_CO_07072025204455341708374149', 'Pending', '{"MerchantRequestID": "25fe-4f8a-9a66-d5cbb202bfb4109124", "CheckoutRequestID": "ws_CO_07072025204455341708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 17:44:57.930956', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (28, '254708374149', 1000.00, 'ws_CO_07072025205043950708374149', 'Pending', '{"MerchantRequestID": "25fe-4f8a-9a66-d5cbb202bfb4109194", "CheckoutRequestID": "ws_CO_07072025205043950708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 17:48:22.69667', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (29, '254708374149', 1000.00, 'ws_CO_07072025205815051708374149', 'Pending', '{"MerchantRequestID": "25fe-4f8a-9a66-d5cbb202bfb4109344", "CheckoutRequestID": "ws_CO_07072025205815051708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 17:55:53.751419', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (30, '254708374149', 1000.00, 'ws_CO_07072025210828453708374149', 'Success', '{"Body": {"stkCallback": {"MerchantRequestID": "abc123", "CheckoutRequestID": "ws_CO_07072025210828453708374149", "ResultCode": 0, "ResultDesc": "The service request is processed successfully."}}}', '2025-07-07 18:06:07.416215', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (31, '254708374149', 1000.00, 'ws_CO_07072025211030233708374149', 'Pending', '{"MerchantRequestID": "25fe-4f8a-9a66-d5cbb202bfb4109580", "CheckoutRequestID": "ws_CO_07072025211030233708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 18:10:32.847025', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (32, '254708374149', 1000.00, 'ws_CO_07072025211423355708374149', 'Pending', '{"MerchantRequestID": "3ac5-4c88-8708-9bd2f5b3e98d101282", "CheckoutRequestID": "ws_CO_07072025211423355708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 18:14:25.998269', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (33, '254708374149', 1000.00, 'ws_CO_07072025211758672708374149', 'Pending', '{"MerchantRequestID": "c5e5-4c99-8aec-84c700cd04ff100452", "CheckoutRequestID": "ws_CO_07072025211758672708374149", "ResponseCode": "0", "ResponseDescription": "Success. Request accepted for processing", "CustomerMessage": "Success. Request accepted for processing"}', '2025-07-07 18:15:37.353534', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (34, '254708374149', 1000.00, 'ws_CO_07072025211858388708374149', 'Success', '{"Body": {"stkCallback": {"MerchantRequestID": "abc123", "CheckoutRequestID": "ws_CO_07072025211858388708374149", "ResultCode": 0, "ResultDesc": "The service request is processed successfully."}}}', '2025-07-07 18:19:01.145454', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (35, '254708374149', 1600.00, 'ws_CO_08072025045243807708374149', 'Success', '{"Body": {"stkCallback": {"MerchantRequestID": "abc123", "CheckoutRequestID": "ws_CO_08072025045243807708374149", "ResultCode": 0, "ResultDesc": "The service request is processed successfully."}}}', '2025-07-08 01:52:44.728734', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (36, '254708374149', 4300.00, 'ws_CO_08072025103758951708374149', 'Success', '{"Body": {"stkCallback": {"MerchantRequestID": "abc123", "CheckoutRequestID": "ws_CO_08072025103758951708374149", "ResultCode": 0, "ResultDesc": "The service request is processed successfully."}}}', '2025-07-08 07:38:02.628498', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (37, '254708374149', 1550.00, 'ws_CO_08072025105929451708374149', 'Success', '{"Body": {"stkCallback": {"MerchantRequestID": "abc123", "CheckoutRequestID": "ws_CO_08072025105929451708374149", "ResultCode": 0, "ResultDesc": "The service request is processed successfully."}}}', '2025-07-08 07:57:08.029479', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (38, '254708374149', 3300.00, 'ws_CO_08072025110220069708374149', 'Success', '{"Body": {"stkCallback": {"MerchantRequestID": "abc123", "CheckoutRequestID": "ws_CO_08072025110220069708374149", "ResultCode": 0, "ResultDesc": "The service request is processed successfully."}}}', '2025-07-08 07:59:58.528189', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (39, '254708374149', 3300.00, 'ws_CO_08072025111113923708374149', 'Success', '{"Body": {"stkCallback": {"MerchantRequestID": "abc123", "CheckoutRequestID": "ws_CO_08072025111113923708374149", "ResultCode": 0, "ResultDesc": "The service request is processed successfully."}}}', '2025-07-08 08:11:15.648094', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (40, '254708374149', 1500.00, 'ws_CO_08072025111829548708374149', 'Success', '{"Body": {"stkCallback": {"MerchantRequestID": "abc123", "CheckoutRequestID": "ws_CO_08072025111829548708374149", "ResultCode": 0, "ResultDesc": "The service request is processed successfully."}}}', '2025-07-08 08:16:08.021108', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (41, '254708374149', 1700.00, 'ws_CO_08072025112952193708374149', 'Success', '{"Body": {"stkCallback": {"MerchantRequestID": "abc123", "CheckoutRequestID": "ws_CO_08072025112952193708374149", "ResultCode": 0, "ResultDesc": "The service request is processed successfully."}}}', '2025-07-08 08:27:31.705696', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (42, '254720955034', 200.00, 'ws_CO_08072025114417555720955034', 'Success', '{"Body": {"stkCallback": {"MerchantRequestID": "abc123", "CheckoutRequestID": "ws_CO_08072025114417555720955034", "ResultCode": 0, "ResultDesc": "The service request is processed successfully."}}}', '2025-07-08 08:41:55.978011', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (43, '254720955034', 1500.00, 'ws_CO_08072025120314834720955034', 'Success', '{"Body": {"stkCallback": {"MerchantRequestID": "abc123", "CheckoutRequestID": "ws_CO_08072025120314834720955034", "ResultCode": 0, "ResultDesc": "The service request is processed successfully."}}}', '2025-07-08 09:03:17.044632', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (44, '254708374149', 1500.00, 'ws_CO_08072025121302898708374149', 'Success', '{"Body": {"stkCallback": {"MerchantRequestID": "abc123", "CheckoutRequestID": "ws_CO_08072025121302898708374149", "ResultCode": 0, "ResultDesc": "The service request is processed successfully."}}}', '2025-07-08 09:10:41.444751', NULL);
INSERT INTO public.mpesa_payments (id, phone_number, amount, transaction_id, status, response_data, created_at, order_id) VALUES (45, '254706564588', 1200.00, 'ws_CO_08072025191534350706564588', 'Success', '{"Body": {"stkCallback": {"MerchantRequestID": "abc123", "CheckoutRequestID": "ws_CO_08072025191534350706564588", "ResultCode": 0, "ResultDesc": "The service request is processed successfully."}}}', '2025-07-08 16:13:17.679602', NULL);


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: thesizzledmunch
--

INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (19, 10, 2, 1, 800.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (20, 10, 3, 1, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (21, 11, 10, 1, 400.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (22, 11, 9, 1, 300.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (28, 13, 2, 1, 800.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (29, 13, 6, 1, 1000.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (30, 14, 3, 1, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (31, 14, 4, 1, 950.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (32, 15, 2, 1, 800.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (33, 15, 5, 1, 1200.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (34, 15, 3, 2, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (38, 17, 11, 1, 300.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (40, 19, 10, 1, 400.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (41, 20, 4, 1, 950.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (50, 26, 3, 1, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (51, 26, 2, 3, 800.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (52, 27, 12, 1, 200.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (53, 27, 11, 1, 300.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (54, 28, 3, 1, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (55, 29, 2, 1, 800.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (56, 30, 3, 1, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (57, 31, 8, 1, 350.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (58, 32, 2, 1, 800.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (59, 32, 3, 1, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (60, 33, 3, 1, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (61, 34, 2, 1, 800.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (62, 35, 3, 1, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (63, 35, 4, 2, 950.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (64, 36, 1, 1, 700.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (65, 36, 7, 1, 200.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (66, 36, 12, 1, 200.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (67, 36, 8, 1, 350.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (68, 36, 9, 1, 300.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (69, 36, 10, 1, 400.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (70, 36, 11, 1, 300.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (71, 37, 4, 1, 950.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (72, 38, 4, 1, 950.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (73, 39, 4, 1, 950.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (74, 40, 4, 1, 950.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (75, 41, 4, 1, 950.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (76, 42, 4, 1, 950.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (77, 43, 4, 1, 950.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (78, 44, 4, 1, 950.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (79, 45, 2, 1, 800.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (80, 46, 2, 2, 800.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (81, 47, 1, 1, 700.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (82, 47, 2, 1, 800.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (83, 48, 4, 1, 950.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (84, 49, 3, 2, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (85, 50, 8, 1, 350.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (86, 50, 9, 1, 300.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (87, 51, 3, 2, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (88, 52, 12, 1, 200.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (89, 53, 11, 1, 300.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (90, 54, 3, 1, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (91, 55, 6, 1, 1000.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (92, 56, 5, 1, 1200.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (93, 57, 3, 1, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (94, 58, 10, 1, 400.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (95, 58, 3, 1, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (96, 59, 3, 2, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (97, 59, 4, 1, 950.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (98, 60, 2, 1, 800.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (99, 61, 8, 1, 350.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (100, 62, 10, 1, 400.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (101, 62, 9, 1, 300.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (102, 62, 11, 1, 300.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (103, 63, 2, 2, 800.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (104, 64, 4, 2, 950.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (105, 64, 5, 2, 1200.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (106, 65, 2, 1, 800.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (107, 65, 3, 2, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (108, 65, 6, 1, 1000.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (109, 66, 2, 1, 800.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (110, 66, 1, 1, 700.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (111, 67, 3, 1, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (112, 67, 4, 1, 950.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (113, 68, 12, 1, 200.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (114, 69, 3, 2, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (115, 70, 3, 2, 750.00);
INSERT INTO public.order_items (id, order_id, menu_item_id, quantity, price) VALUES (116, 71, 5, 1, 1200.00);


--
-- Name: admin_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: thesizzledmunch
--

SELECT pg_catalog.setval('public.admin_users_id_seq', 1, true);


--
-- Name: cart_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: thesizzledmunch
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 199, true);


--
-- Name: cart_summaries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: thesizzledmunch
--

SELECT pg_catalog.setval('public.cart_summaries_id_seq', 93, true);


--
-- Name: menu_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: thesizzledmunch
--

SELECT pg_catalog.setval('public.menu_items_id_seq', 14, true);


--
-- Name: mpesa_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: thesizzledmunch
--

SELECT pg_catalog.setval('public.mpesa_payments_id_seq', 45, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: thesizzledmunch
--

SELECT pg_catalog.setval('public.order_items_id_seq', 116, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: thesizzledmunch
--

SELECT pg_catalog.setval('public.orders_id_seq', 71, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: thesizzledmunch
--

SELECT pg_catalog.setval('public.user_id_seq', 20, true);


--
-- PostgreSQL database dump complete
--

