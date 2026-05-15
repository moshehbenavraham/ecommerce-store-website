import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import SEO from "../components/SEO";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Page Not Found"
        description="The page you're looking for can't be found. Browse Linea's curated jewelry collections instead."
        noindex
      />
      <Header />

      <main id="main-content" className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-md">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Error 404
          </p>
          <h1 className="text-5xl md:text-6xl font-light text-foreground mb-6">
            Page not found
          </h1>
          <p className="text-base font-light text-muted-foreground leading-relaxed mb-10">
            The page you're looking for has been moved, renamed, or never
            existed. Let us guide you back to our collections.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="rounded-none h-12 px-8 text-sm font-light">
              <Link to="/">Return Home</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-none h-12 px-8 text-sm font-light"
            >
              <Link to="/category/shop">Browse Collections</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
