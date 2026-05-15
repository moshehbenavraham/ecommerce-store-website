import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import CategoryHeader from "../components/category/CategoryHeader";
import FilterSortBar from "../components/category/FilterSortBar";
import ProductGrid from "../components/category/ProductGrid";
import SEO from "../components/SEO";

const titleCase = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const Category = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const label = category ? titleCase(category) : "All Products";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={label}
        description={`Shop Linea's ${label.toLowerCase()} collection — minimalist, architecturally inspired jewelry crafted for the modern individual.`}
        path={`/category/${category ?? "shop"}`}
      />
      <Header />

      <main id="main-content" className="pt-6">
        <CategoryHeader
          category={category || 'All Products'}
        />

        <FilterSortBar
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          itemCount={24}
        />

        <ProductGrid />
      </main>

      <Footer />
    </div>
  );
};

export default Category;