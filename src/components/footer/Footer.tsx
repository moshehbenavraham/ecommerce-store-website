import { Link } from "react-router-dom";
import {
  SITE_CONTACT_EMAIL,
  SITE_PHONE,
  getActiveSocialLinks,
  getNewsletterHref,
} from "@/lib/site";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const socialLinks = getActiveSocialLinks();
  const newsletterHref = getNewsletterHref();

  return (
    <footer className="w-full bg-background text-foreground pt-8 pb-2 px-6 border-t border-border mt-48">
      <div className="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
          {/* Brand - Left side */}
          <div>
            <img
              src="/Linea_Jewelry_Inc-2.svg"
              alt="Linea Jewelry Inc."
              className="mb-4 h-6 w-auto dark:invert"
              width="120"
              height="24"
              loading="lazy"
            />
            <p className="text-sm font-light text-foreground/70 leading-relaxed max-w-md mb-6">
              Minimalist jewelry crafted for the modern individual
            </p>

            {/* Contact Information */}
            <address className="not-italic space-y-2 text-sm font-light text-foreground/70">
              <div>
                <p className="font-normal text-foreground mb-1">Visit Us</p>
                <p>123 Madison Avenue</p>
                <p>New York, NY 10016</p>
              </div>
              <div>
                <p className="font-normal text-foreground mb-1 mt-3">Contact</p>
                <p>
                  <a
                    href={`tel:${SITE_PHONE.replace(/[^+\d]/g, "")}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {SITE_PHONE}
                  </a>
                </p>
                <p>
                  <a
                    href={`mailto:${SITE_CONTACT_EMAIL}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {SITE_CONTACT_EMAIL}
                  </a>
                </p>
              </div>
            </address>
          </div>

          {/* Link lists - Right side */}
          <nav aria-label="Footer" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Shop */}
            <div>
              <h4 className="text-sm font-normal mb-4">Shop</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/category/new-in"
                    className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors"
                  >
                    New In
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/rings"
                    className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Rings
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/earrings"
                    className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Earrings
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/bracelets"
                    className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Bracelets
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/necklaces"
                    className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Necklaces
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-normal mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about/size-guide"
                    className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Size Guide
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about/customer-care"
                    className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Care Instructions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about/customer-care"
                    className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Returns
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about/customer-care"
                    className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about/customer-care"
                    className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-sm font-normal mb-4">Connect</h4>
              <ul className="space-y-2">
                {socialLinks.length > 0 ? (
                  socialLinks.map((social) => (
                    <li key={social.platform}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors"
                      >
                        {social.label}
                      </a>
                    </li>
                  ))
                ) : (
                  /*
                   * Social profiles aren't live yet. Rather than link to
                   * fictional placeholder URLs (the previous default pointed
                   * Instagram/Pinterest at other companies' homepages), the
                   * footer omits the platform rows entirely until a real
                   * handle is wired up in src/lib/site.ts.
                   */
                  <li>
                    <span className="text-sm font-light text-foreground/50">
                      Social channels launching soon
                    </span>
                  </li>
                )}
                <li>
                  <a
                    href={newsletterHref}
                    className="text-sm font-light text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Newsletter
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>

      {/* Bottom section - edge to edge separator */}
      <div className="border-t border-border -mx-6 px-6 pt-2">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm font-light text-foreground mb-1 md:mb-0">
            © {currentYear} Linea. All rights reserved. Template made by{" "}
            <a
              href="https://www.liljeros.co"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground/70 transition-colors underline"
            >
              Rickard Liljeros
            </a>
          </p>
          <div className="flex space-x-6">
            <Link
              to="/privacy-policy"
              className="text-sm font-light text-foreground hover:text-foreground/70 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="text-sm font-light text-foreground hover:text-foreground/70 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
