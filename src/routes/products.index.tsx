import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, ProductFilters, ProductTable, Section } from "@/components/page-kit";
import { statusFor, useInventory } from "@/lib/inventory";

const productsRoute = getRouteApi("/products");

export const Route = createFileRoute("/products/")({
  head: () => ({ meta: [{ title: "Products — StockSense" }, { name: "description", content: "Search and manage products across all warehouse locations." }, { property: "og:title", content: "Products — StockSense" }, { property: "og:description", content: "Search and manage products across all warehouse locations." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const { products } = useInventory();
  const search = productsRoute.useSearch();
  const [query, setQuery] = useState(search.q ?? "");
  const filtered = products.filter((product) => (`${product.name} ${product.sku} ${product.category}`).toLowerCase().includes(query.toLowerCase()) && (!search.status || ["At Risk", "Critical"].includes(statusFor(product))));
  return <><PageHeader eyebrow="Inventory" title="Products" description={`${filtered.length} products across 4 active locations.`} actions={<Button><Plus /> Add product</Button>} /><Section><ProductFilters query={query} onQuery={setQuery} /><ProductTable products={filtered} /></Section></>;
}