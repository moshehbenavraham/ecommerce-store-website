import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductDescription from "../components/product/ProductDescription";
import ProductCarousel from "../components/content/ProductCarousel";
import SEO, { SITE_URL } from "../components/SEO";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

const titleCase = (slug: string) =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const ProductDetail = () => {
  const { productId } = useParams();
  const productLabel = productId ? titleCase(productId) : "Pantheon";
  const path = `/product/${productId ?? "pantheon"}`;

  // Memoize so SEO's useEffect doesn't fire on every parent re-render with a fresh reference.
  const productJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Product",
      name: productLabel,
      description: `${productLabel} — handcrafted minimalist jewelry from Linea's architectural collections.`,
      image: `${SITE_URL}/social-card.svg`,
      brand: { "@type": "Brand", name: "Linea" },
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}${path}`,
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    }),
    [productLabel, path],
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={productLabel}
        description={`${productLabel} from Linea — minimalist, architecturally inspired jewelry crafted for the modern individual.`}
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
                    <Link to="/category/earrings">Earrings</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Pantheon</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <ProductImageGallery />
            
            <div className="lg:pl-12 mt-8 lg:mt-0 lg:sticky lg:top-6 lg:h-fit">
              <ProductInfo />
              <ProductDescription />
            </div>
          </div>
        </section>
        
        <section className="w-full mt-16 lg:mt-24">
          <div className="mb-4 px-6">
            <h2 className="text-sm font-light text-foreground">You might also like</h2>
          </div>
          <ProductCarousel />
        </section>
        
        <section className="w-full">
          <div className="mb-4 px-6">
            <h2 className="text-sm font-light text-foreground">Our other Earrings</h2>
          </div>
          <ProductCarousel />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;