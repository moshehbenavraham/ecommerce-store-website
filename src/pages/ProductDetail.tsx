import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductDescription from "../components/product/ProductDescription";
import ProductCarousel from "../components/content/ProductCarousel";
import SEO from "../components/SEO";
import { SITE_URL } from "@/lib/site";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { getProductBySlug, getRelatedProducts, PRODUCTS } from "@/lib/products";

const ProductDetail = () => {
  const { productId } = useParams();
  // Default to the first canonical product when the slug is missing rather than
  // showing "Pantheon" via a hardcoded fallback that didn't match the URL.
  const product = getProductBySlug(productId) ?? PRODUCTS[0];
  const path = `/product/${product.slug}`;
  const related = useMemo(() => getRelatedProducts(product.slug), [product.slug]);
  const sameCategory = useMemo(
    () => PRODUCTS.filter((p) => p.slug !== product.slug && p.category === product.category),
    [product.slug, product.category],
  );

  // Memoize so SEO's useEffect doesn't fire on every parent re-render with a fresh reference.
  const productJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.blurb,
      image: `${SITE_URL}/social-card.svg`,
      brand: { "@type": "Brand", name: "Linea" },
      category: product.category,
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}${path}`,
        price: String(product.priceEUR),
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    }),
    [product, path],
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={product.name}
        description={`${product.name} — ${product.blurb}`}
        path={path}
        type="product"
        jsonLd={productJsonLd}
      />
      <Header />

      <main id="main-content" className="pt-6">
        <section className="w-full px-6">
          {/* Breadcrumb - Show above image on smaller screens */}
          <div className="lg:hidden mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/category/${product.categorySlug}`}>{product.category}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <ProductImageGallery />

            <div className="lg:pl-12 mt-8 lg:mt-0 lg:sticky lg:top-6 lg:h-fit">
              <ProductInfo product={product} />
              <ProductDescription />
            </div>
          </div>
        </section>

        <section className="w-full mt-16 lg:mt-24" aria-labelledby="related-heading">
          <div className="mb-4 px-6">
            <h2 id="related-heading" className="text-sm font-light text-foreground">
              You might also like
            </h2>
          </div>
          <ProductCarousel products={related} />
        </section>

        {sameCategory.length > 0 && (
          <section className="w-full" aria-labelledby="same-category-heading">
            <div className="mb-4 px-6">
              <h2 id="same-category-heading" className="text-sm font-light text-foreground">
                Our other {product.category}
              </h2>
            </div>
            <ProductCarousel products={sameCategory} />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
