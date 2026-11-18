# Finance package - hidden profit and loss dashboard (Phase 6)

**Purpose:** give the shop owner an accurate picture of sales, costs, profit, loss, stock and cart activity, built only from real order records.

## Accounting rules (must appear in the product)

- Keep separate: gross sales, discounts, refunds, collected revenue, cost of goods sold (COGS), payment fees, shipping expenses, operating expenses, taxes, and net profit or loss.
- **Never label revenue as profit.**
- **Cost snapshot:** store the unit cost on each order item at the time of sale. Otherwise past profits change when a product cost is edited.
- Operating expenses are entered manually. Payment fees come from provider reconciliation. Taxes are tracked as liabilities.
- Show data-completeness warnings (for example, products with no cost).

## Access rules

- Uses Bagisto authentication, two-factor authentication and permissions (ADR-007).
- Reached through a custom admin path (an extra layer only). **Not listed in robots.txt or the sitemap**, and not linked anywhere in the public storefront. Use an `X-Robots-Tag: noindex, nofollow` header on that path.
- No public API.

## v1 scope

Daily and monthly sales, orders by status, average order value, COGS, gross profit, low stock.
Postponed: abandoned carts (privacy and consent review first), customer analytics, advanced reports.
