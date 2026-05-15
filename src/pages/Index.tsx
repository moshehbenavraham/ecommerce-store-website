import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import LargeHero from "../components/content/LargeHero";
import FiftyFiftySection from "../components/content/FiftyFiftySection";
import OneThirdTwoThirdsSection from "../components/content/OneThirdTwoThirdsSection";
import ProductCarousel from "../components/content/ProductCarousel";
import EditorialSection from "../components/content/EditorialSection";
import SEO from "../components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        description="Discover Linea — minimalist jewelry crafted for the modern individual. Curated rings, earrings, bracelets, and necklaces from architectural collections."
        path="/"
      />
      <Header />

      <main id="main-content" className="pt-6">
        <FiftyFiftySection />
        <ProductCarousel />
        <LargeHero />
        <OneThirdTwoThirdsSection />
        <EditorialSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
