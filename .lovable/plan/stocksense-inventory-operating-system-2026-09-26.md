# StockSense inventory operating system

## Goal
Build a polished, production-style inventory workspace that lets an evaluator understand stock health, act on risks, complete inventory operations, and see every change reflected across the app within 60–90 seconds.

## Experience and visual system
- Create a calm enterprise interface using warm-white surfaces, charcoal typography, a restrained deep-blue accent, compact status colors, subtle borders, small radii, and restrained shadows.
- Use a persistent collapsible desktop sidebar, mobile navigation drawer, global search, command center, notifications, warehouse selection, and responsive data layouts.
- Keep motion brief and functional: page entry, drawers, dialogs, status changes, and chart loading; respect reduced-motion preferences.
- Create a minimal split login screen and a complete authenticated workspace shell.

## Core product structure
- Add separate pages for Overview, Products, Stock by Location, Low Stock, Receipts, Deliveries, Transfers, Adjustments, Stock Ledger, Intelligence, Risk Monitor, What-if Simulator, Warehouses, Settings, Profile, and Login.
- Add route-specific titles and descriptions for every page.
- Reuse focused interface pieces for KPI summaries, health scoring, risk explanations, recommendations, tables, status badges, stock trajectory, location distribution, timelines, operation forms, confirmation dialogs, notifications, and warehouse maps.

## Working inventory model
- Seed the eight requested products and four warehouses with intentionally varied stock health and movement history.
- Keep one shared browser-persisted inventory store so completed operations survive refreshes.
- Recalculate totals, location balances, statuses, KPIs, risk scores, recommendations, and projections whenever inventory changes.
- Validate receipts by increasing stock and recording a ledger entry.
- Validate deliveries by decreasing stock, preventing negative inventory, and offering another-location suggestions when stock is insufficient.
- Complete transfers by updating source and destination without changing company totals, then record the movement.
- Complete physical-count adjustments by replacing the recorded location quantity and creating an audit entry.

## Intelligence workflows
- Explain risk with deterministic factors such as consumption trend, coverage, reorder threshold, incoming supply, and recent movements.
- Calculate reorder quantity and timing from demand, current stock, incoming stock, and safety buffer.
- Surface neutral anomaly explanations, inventory-balancing suggestions, and reviewable transfer recommendations.
- Add a live what-if simulator for demand, supplier delay, and warehouse outage scenarios.
- Add Ctrl+K command parsing for predefined searches, risk views, receipts, and prefilled transfer actions; require confirmation before mutations.
- Add `/` search focus and global search across products, SKUs, operations, warehouses, and categories.

## Verification
- Check the responsive desktop and mobile layouts, navigation, dialogs, tables, charts, and text fitting.
- Run the evaluator flow end to end: inspect Steel Rods risk, view reorder reasoning, accept a balancing transfer, confirm stock and ledger updates, then change the what-if demand scenario.
- Confirm receipt, delivery, transfer, and adjustment arithmetic and negative-stock prevention.
