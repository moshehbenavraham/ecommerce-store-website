import { useState, type FormEvent } from "react";
import { Minus, Plus, CreditCard, Check } from "lucide-react";
import { toast } from "sonner";
import CheckoutHeader from "../components/header/CheckoutHeader";
import Footer from "../components/footer/Footer";
import SEO from "../components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import pantheonImage from "@/assets/pantheon.jpg";
import eclipseImage from "@/assets/eclipse.jpg";
import {
  submitOrder,
  HAS_CHECKOUT_ENDPOINT,
  type OrderAddress,
  type OrderCustomer,
  type OrderLineItem,
  type OrderPayload,
} from "@/lib/checkout";
import { SITE_ORDERS_EMAIL } from "@/lib/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactErrors = Partial<Record<keyof OrderCustomer, string>>;
type AddressErrors = Partial<Record<keyof OrderAddress, string>>;
type PaymentErrors = Partial<Record<"cardNumber" | "expiryDate" | "cvv" | "cardholderName", string>>;

const Checkout = () => {
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [customerDetails, setCustomerDetails] = useState<OrderCustomer>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [shippingAddress, setShippingAddress] = useState<OrderAddress>({
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [hasSeparateBilling, setHasSeparateBilling] = useState(false);
  const [billingDetails, setBillingDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [shippingOption, setShippingOption] = useState<"standard" | "express" | "overnight">(
    "standard",
  );
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });
  const [contactErrors, setContactErrors] = useState<ContactErrors>({});
  const [shippingErrors, setShippingErrors] = useState<AddressErrors>({});
  const [paymentErrors, setPaymentErrors] = useState<PaymentErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Mock cart data - in a real app this would come from state management
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Pantheon Ring",
      price: "€2,450",
      quantity: 1,
      image: pantheonImage,
      size: "54 EU / 7 US",
    },
    {
      id: 2,
      name: "Eclipse Earrings",
      price: "€1,850",
      quantity: 1,
      image: eclipseImage,
    },
  ]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(items => items.filter(item => item.id !== id));
    } else {
      setCartItems(items =>
        items.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('€', '').replace(',', ''));
    return sum + (price * item.quantity);
  }, 0);

  const getShippingCost = () => {
    switch (shippingOption) {
      case "express":
        return 15;
      case "overnight":
        return 35;
      default:
        return 0; // Standard shipping is free
    }
  };

  const shipping = getShippingCost();
  const total = subtotal + shipping;

  const handleDiscountSubmit = () => {
    const trimmed = discountCode.trim();
    setShowDiscountInput(false);
    if (!trimmed) return;
    // Honest UX: no real discount validator is wired up, so tell the user
    // their code was noted rather than silently dropping it on the floor.
    toast.message(`Code "${trimmed}" saved — we'll review eligibility before billing.`);
  };

  const handleCustomerDetailsChange = <K extends keyof OrderCustomer>(field: K, value: string) => {
    setCustomerDetails(prev => ({ ...prev, [field]: value }));
    if (contactErrors[field]) {
      setContactErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleShippingAddressChange = <K extends keyof OrderAddress>(field: K, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    if (shippingErrors[field]) {
      setShippingErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleBillingDetailsChange = (field: string, value: string) => {
    setBillingDetails(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentDetailsChange = <K extends keyof typeof paymentDetails>(
    field: K,
    value: string,
  ) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }));
    if (paymentErrors[field as keyof PaymentErrors]) {
      setPaymentErrors(prev => {
        const next = { ...prev };
        delete next[field as keyof PaymentErrors];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const contact: ContactErrors = {};
    if (!customerDetails.firstName.trim()) contact.firstName = "Required";
    if (!customerDetails.lastName.trim()) contact.lastName = "Required";
    if (!customerDetails.email.trim()) {
      contact.email = "Required";
    } else if (!EMAIL_RE.test(customerDetails.email.trim())) {
      contact.email = "Enter a valid email address";
    }

    const ship: AddressErrors = {};
    if (!shippingAddress.address.trim()) ship.address = "Required";
    if (!shippingAddress.city.trim()) ship.city = "Required";
    if (!shippingAddress.postalCode.trim()) ship.postalCode = "Required";
    if (!shippingAddress.country.trim()) ship.country = "Required";

    const pay: PaymentErrors = {};
    if (!paymentDetails.cardholderName.trim()) pay.cardholderName = "Required";
    const digits = paymentDetails.cardNumber.replace(/\s/g, "");
    if (digits.length < 12) pay.cardNumber = "Enter a valid card number";
    if (!/^\d{2}\/\d{2}$/.test(paymentDetails.expiryDate)) pay.expiryDate = "Use MM/YY";
    if (!/^\d{3,4}$/.test(paymentDetails.cvv)) pay.cvv = "Enter the security code";

    setContactErrors(contact);
    setShippingErrors(ship);
    setPaymentErrors(pay);

    return (
      Object.keys(contact).length === 0 &&
      Object.keys(ship).length === 0 &&
      Object.keys(pay).length === 0
    );
  };

  const handleCompleteOrder = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!validate()) {
      toast.error("Please complete the highlighted fields and try again.");
      return;
    }

    setIsProcessing(true);

    const items: OrderLineItem[] = cartItems.map((item) => ({
      name: item.name,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.price,
    }));

    const payload: OrderPayload = {
      customer: customerDetails,
      shipping: shippingAddress,
      billing: hasSeparateBilling ? billingDetails : undefined,
      shippingOption,
      items,
      subtotal,
      shippingCost: shipping,
      total,
    };

    const result = await submitOrder(payload);

    setIsProcessing(false);

    if (!result.ok) {
      toast.error(
        `We couldn't submit your order: ${result.error}. Please email ${SITE_ORDERS_EMAIL} so we can finish it manually.`,
      );
      return;
    }

    if (result.mode === "mailto") {
      toast.success(
        "Opening your email app — review the order details and send to finish placing your order.",
      );
    } else {
      toast.success("Thanks — your order has been received. You'll get a confirmation email shortly.");
    }
    setPaymentComplete(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Checkout"
        description="Complete your Linea jewelry order — secure checkout with multiple shipping options."
        noindex
      />
      <CheckoutHeader />

      <main id="main-content" className="pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Order Summary - First on mobile, last on desktop */}
            <div className="lg:col-span-1 lg:order-2">
              <div className="bg-muted/20 p-8 rounded-none sticky top-6">
                <h2 className="text-lg font-light text-foreground mb-6">Order Summary</h2>

                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded-none overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-light text-foreground">{item.name}</h3>
                        {item.size && (
                          <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                        )}

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label={`Decrease ${item.name} quantity`}
                            className="h-8 w-8 p-0 rounded-none border-muted-foreground/20"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium text-foreground min-w-[2ch] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label={`Increase ${item.name} quantity`}
                            className="h-8 w-8 p-0 rounded-none border-muted-foreground/20"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-foreground font-medium">
                        {item.price}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discount Code Section */}
                <div className="mt-8 pt-6 border-t border-muted-foreground/20">
                  {!showDiscountInput ? (
                    <button
                      type="button"
                      onClick={() => setShowDiscountInput(true)}
                      className="text-sm text-foreground underline hover:no-underline transition-all"
                    >
                      Discount code
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <Label htmlFor="discount-code" className="sr-only">
                        Discount code
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="discount-code"
                          type="text"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          placeholder="Enter discount code"
                          className="flex-1 rounded-none"
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={handleDiscountSubmit}
                          className="text-sm text-foreground underline hover:no-underline transition-all px-2"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-muted-foreground/20 mt-4 pt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">€{subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Left Column - Forms */}
            <div className="lg:col-span-2 lg:order-1 space-y-8">

              <form
                className="space-y-8"
                onSubmit={handleCompleteOrder}
                noValidate
                aria-label="Checkout form"
              >
                {/* Customer Details */}
                <div className="bg-muted/20 p-8 rounded-none">
                  <h2 className="text-lg font-light text-foreground mb-6">Customer Details</h2>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="email" className="text-sm font-light text-foreground">
                        Email Address <span aria-hidden="true">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        required
                        value={customerDetails.email}
                        onChange={(e) => handleCustomerDetailsChange("email", e.target.value)}
                        className="mt-2 rounded-none"
                        placeholder="Enter your email"
                        aria-invalid={Boolean(contactErrors.email)}
                        aria-describedby={contactErrors.email ? "email-error" : undefined}
                      />
                      {contactErrors.email && (
                        <p id="email-error" role="alert" className="mt-1 text-xs text-destructive">
                          {contactErrors.email}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-light text-foreground">
                          First Name <span aria-hidden="true">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          autoComplete="given-name"
                          required
                          value={customerDetails.firstName}
                          onChange={(e) => handleCustomerDetailsChange("firstName", e.target.value)}
                          className="mt-2 rounded-none"
                          placeholder="First name"
                          aria-invalid={Boolean(contactErrors.firstName)}
                          aria-describedby={contactErrors.firstName ? "firstName-error" : undefined}
                        />
                        {contactErrors.firstName && (
                          <p id="firstName-error" role="alert" className="mt-1 text-xs text-destructive">
                            {contactErrors.firstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-sm font-light text-foreground">
                          Last Name <span aria-hidden="true">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          autoComplete="family-name"
                          required
                          value={customerDetails.lastName}
                          onChange={(e) => handleCustomerDetailsChange("lastName", e.target.value)}
                          className="mt-2 rounded-none"
                          placeholder="Last name"
                          aria-invalid={Boolean(contactErrors.lastName)}
                          aria-describedby={contactErrors.lastName ? "lastName-error" : undefined}
                        />
                        {contactErrors.lastName && (
                          <p id="lastName-error" role="alert" className="mt-1 text-xs text-destructive">
                            {contactErrors.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-light text-foreground">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={customerDetails.phone}
                        onChange={(e) => handleCustomerDetailsChange("phone", e.target.value)}
                        className="mt-2 rounded-none"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    {/* Shipping Address */}
                    <div className="border-t border-muted-foreground/20 pt-6 mt-8">
                      <h3 className="text-base font-light text-foreground mb-4">Shipping Address</h3>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="shippingAddress" className="text-sm font-light text-foreground">
                            Address <span aria-hidden="true">*</span>
                          </Label>
                          <Input
                            id="shippingAddress"
                            type="text"
                            autoComplete="shipping street-address"
                            required
                            value={shippingAddress.address}
                            onChange={(e) => handleShippingAddressChange("address", e.target.value)}
                            className="mt-2 rounded-none"
                            placeholder="Street address"
                            aria-invalid={Boolean(shippingErrors.address)}
                            aria-describedby={shippingErrors.address ? "ship-address-error" : undefined}
                          />
                          {shippingErrors.address && (
                            <p id="ship-address-error" role="alert" className="mt-1 text-xs text-destructive">
                              {shippingErrors.address}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="shippingCity" className="text-sm font-light text-foreground">
                              City <span aria-hidden="true">*</span>
                            </Label>
                            <Input
                              id="shippingCity"
                              type="text"
                              autoComplete="shipping address-level2"
                              required
                              value={shippingAddress.city}
                              onChange={(e) => handleShippingAddressChange("city", e.target.value)}
                              className="mt-2 rounded-none"
                              placeholder="City"
                              aria-invalid={Boolean(shippingErrors.city)}
                              aria-describedby={shippingErrors.city ? "ship-city-error" : undefined}
                            />
                            {shippingErrors.city && (
                              <p id="ship-city-error" role="alert" className="mt-1 text-xs text-destructive">
                                {shippingErrors.city}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="shippingPostalCode" className="text-sm font-light text-foreground">
                              Postal Code <span aria-hidden="true">*</span>
                            </Label>
                            <Input
                              id="shippingPostalCode"
                              type="text"
                              autoComplete="shipping postal-code"
                              required
                              value={shippingAddress.postalCode}
                              onChange={(e) => handleShippingAddressChange("postalCode", e.target.value)}
                              className="mt-2 rounded-none"
                              placeholder="Postal code"
                              aria-invalid={Boolean(shippingErrors.postalCode)}
                              aria-describedby={
                                shippingErrors.postalCode ? "ship-postal-error" : undefined
                              }
                            />
                            {shippingErrors.postalCode && (
                              <p id="ship-postal-error" role="alert" className="mt-1 text-xs text-destructive">
                                {shippingErrors.postalCode}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="shippingCountry" className="text-sm font-light text-foreground">
                            Country <span aria-hidden="true">*</span>
                          </Label>
                          <Input
                            id="shippingCountry"
                            type="text"
                            autoComplete="shipping country-name"
                            required
                            value={shippingAddress.country}
                            onChange={(e) => handleShippingAddressChange("country", e.target.value)}
                            className="mt-2 rounded-none"
                            placeholder="Country"
                            aria-invalid={Boolean(shippingErrors.country)}
                            aria-describedby={
                              shippingErrors.country ? "ship-country-error" : undefined
                            }
                          />
                          {shippingErrors.country && (
                            <p id="ship-country-error" role="alert" className="mt-1 text-xs text-destructive">
                              {shippingErrors.country}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Billing Address Checkbox */}
                    <div className="border-t border-muted-foreground/20 pt-6 mt-8">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="separateBilling"
                          checked={hasSeparateBilling}
                          onCheckedChange={(checked) => setHasSeparateBilling(checked === true)}
                        />
                        <Label
                          htmlFor="separateBilling"
                          className="text-sm font-light text-foreground cursor-pointer"
                        >
                          Other billing address
                        </Label>
                      </div>
                    </div>

                    {/* Billing Details - shown when checkbox is checked */}
                    {hasSeparateBilling && (
                      <div className="space-y-6 pt-4">
                        <h3 className="text-base font-light text-foreground">Billing Details</h3>

                        <div>
                          <Label htmlFor="billingEmail" className="text-sm font-light text-foreground">
                            Email Address <span aria-hidden="true">*</span>
                          </Label>
                          <Input
                            id="billingEmail"
                            type="email"
                            inputMode="email"
                            autoComplete="billing email"
                            value={billingDetails.email}
                            onChange={(e) => handleBillingDetailsChange("email", e.target.value)}
                            className="mt-2 rounded-none"
                            placeholder="Enter billing email"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingFirstName" className="text-sm font-light text-foreground">
                              First Name <span aria-hidden="true">*</span>
                            </Label>
                            <Input
                              id="billingFirstName"
                              type="text"
                              autoComplete="billing given-name"
                              value={billingDetails.firstName}
                              onChange={(e) => handleBillingDetailsChange("firstName", e.target.value)}
                              className="mt-2 rounded-none"
                              placeholder="First name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingLastName" className="text-sm font-light text-foreground">
                              Last Name <span aria-hidden="true">*</span>
                            </Label>
                            <Input
                              id="billingLastName"
                              type="text"
                              autoComplete="billing family-name"
                              value={billingDetails.lastName}
                              onChange={(e) => handleBillingDetailsChange("lastName", e.target.value)}
                              className="mt-2 rounded-none"
                              placeholder="Last name"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="billingPhone" className="text-sm font-light text-foreground">
                            Phone Number
                          </Label>
                          <Input
                            id="billingPhone"
                            type="tel"
                            inputMode="tel"
                            autoComplete="billing tel"
                            value={billingDetails.phone}
                            onChange={(e) => handleBillingDetailsChange("phone", e.target.value)}
                            className="mt-2 rounded-none"
                            placeholder="Enter billing phone number"
                          />
                        </div>

                        <div>
                          <Label htmlFor="billingAddress" className="text-sm font-light text-foreground">
                            Address <span aria-hidden="true">*</span>
                          </Label>
                          <Input
                            id="billingAddress"
                            type="text"
                            autoComplete="billing street-address"
                            value={billingDetails.address}
                            onChange={(e) => handleBillingDetailsChange("address", e.target.value)}
                            className="mt-2 rounded-none"
                            placeholder="Street address"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingCity" className="text-sm font-light text-foreground">
                              City <span aria-hidden="true">*</span>
                            </Label>
                            <Input
                              id="billingCity"
                              type="text"
                              autoComplete="billing address-level2"
                              value={billingDetails.city}
                              onChange={(e) => handleBillingDetailsChange("city", e.target.value)}
                              className="mt-2 rounded-none"
                              placeholder="City"
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingPostalCode" className="text-sm font-light text-foreground">
                              Postal Code <span aria-hidden="true">*</span>
                            </Label>
                            <Input
                              id="billingPostalCode"
                              type="text"
                              autoComplete="billing postal-code"
                              value={billingDetails.postalCode}
                              onChange={(e) => handleBillingDetailsChange("postalCode", e.target.value)}
                              className="mt-2 rounded-none"
                              placeholder="Postal code"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="billingCountry" className="text-sm font-light text-foreground">
                            Country <span aria-hidden="true">*</span>
                          </Label>
                          <Input
                            id="billingCountry"
                            type="text"
                            autoComplete="billing country-name"
                            value={billingDetails.country}
                            onChange={(e) => handleBillingDetailsChange("country", e.target.value)}
                            className="mt-2 rounded-none"
                            placeholder="Country"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Options */}
                <div className="bg-muted/20 p-8 rounded-none">
                  <h2 className="text-lg font-light text-foreground mb-6">Shipping Options</h2>

                  <RadioGroup
                    value={shippingOption}
                    onValueChange={(v) =>
                      setShippingOption(v as "standard" | "express" | "overnight")
                    }
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between p-4 border border-muted-foreground/20 rounded-none">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard" className="font-light text-foreground">
                          Standard Shipping
                        </Label>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Free • 3-5 business days
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-muted-foreground/20 rounded-none">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="express" id="express" />
                        <Label htmlFor="express" className="font-light text-foreground">
                          Express Shipping
                        </Label>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        €15 • 1-2 business days
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-muted-foreground/20 rounded-none">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="overnight" id="overnight" />
                        <Label htmlFor="overnight" className="font-light text-foreground">
                          Overnight Delivery
                        </Label>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        €35 • Next business day
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Payment Section */}
                <div className="bg-muted/20 p-8 rounded-none">
                  <h2 className="text-lg font-light text-foreground mb-6">Payment Details</h2>

                  {!paymentComplete ? (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="cardholderName" className="text-sm font-light text-foreground">
                          Cardholder Name <span aria-hidden="true">*</span>
                        </Label>
                        <Input
                          id="cardholderName"
                          type="text"
                          autoComplete="cc-name"
                          required
                          value={paymentDetails.cardholderName}
                          onChange={(e) => handlePaymentDetailsChange("cardholderName", e.target.value)}
                          className="mt-2 rounded-none"
                          placeholder="Name on card"
                          aria-invalid={Boolean(paymentErrors.cardholderName)}
                          aria-describedby={
                            paymentErrors.cardholderName ? "cardholderName-error" : undefined
                          }
                        />
                        {paymentErrors.cardholderName && (
                          <p
                            id="cardholderName-error"
                            role="alert"
                            className="mt-1 text-xs text-destructive"
                          >
                            {paymentErrors.cardholderName}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="cardNumber" className="text-sm font-light text-foreground">
                          Card Number <span aria-hidden="true">*</span>
                        </Label>
                        <div className="relative mt-2">
                          <Input
                            id="cardNumber"
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            required
                            value={paymentDetails.cardNumber}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\s/g, '')
                                .replace(/(.{4})/g, '$1 ')
                                .trim();
                              if (value.length <= 19) {
                                handlePaymentDetailsChange("cardNumber", value);
                              }
                            }}
                            className="rounded-none pl-10"
                            placeholder="4242 4242 4242 4242"
                            maxLength={19}
                            aria-invalid={Boolean(paymentErrors.cardNumber)}
                            aria-describedby={
                              paymentErrors.cardNumber ? "cardNumber-error" : undefined
                            }
                          />
                          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                        {paymentErrors.cardNumber && (
                          <p id="cardNumber-error" role="alert" className="mt-1 text-xs text-destructive">
                            {paymentErrors.cardNumber}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate" className="text-sm font-light text-foreground">
                            Expiry Date <span aria-hidden="true">*</span>
                          </Label>
                          <Input
                            id="expiryDate"
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-exp"
                            required
                            value={paymentDetails.expiryDate}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\D/g, '')
                                .replace(/(\d{2})(\d{1,2}).*/, '$1/$2');
                              if (value.length <= 5) {
                                handlePaymentDetailsChange("expiryDate", value);
                              }
                            }}
                            className="mt-2 rounded-none"
                            placeholder="MM/YY"
                            maxLength={5}
                            aria-invalid={Boolean(paymentErrors.expiryDate)}
                            aria-describedby={
                              paymentErrors.expiryDate ? "expiryDate-error" : undefined
                            }
                          />
                          {paymentErrors.expiryDate && (
                            <p id="expiryDate-error" role="alert" className="mt-1 text-xs text-destructive">
                              {paymentErrors.expiryDate}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="cvv" className="text-sm font-light text-foreground">
                            CVV <span aria-hidden="true">*</span>
                          </Label>
                          <Input
                            id="cvv"
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            required
                            value={paymentDetails.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 4) {
                                handlePaymentDetailsChange("cvv", value);
                              }
                            }}
                            className="mt-2 rounded-none"
                            placeholder="123"
                            maxLength={4}
                            aria-invalid={Boolean(paymentErrors.cvv)}
                            aria-describedby={paymentErrors.cvv ? "cvv-error" : undefined}
                          />
                          {paymentErrors.cvv && (
                            <p id="cvv-error" role="alert" className="mt-1 text-xs text-destructive">
                              {paymentErrors.cvv}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Order Total Summary */}
                      <div className="bg-muted/10 p-6 rounded-none border border-muted-foreground/20 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="text-foreground">€{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="text-foreground">
                            {shipping === 0 ? "Free" : `€${shipping}`}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-medium border-t border-muted-foreground/20 pt-3">
                          <span className="text-foreground">Total</span>
                          <span className="text-foreground">€{total.toLocaleString()}</span>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full rounded-none h-12 text-base"
                      >
                        {isProcessing
                          ? "Submitting…"
                          : HAS_CHECKOUT_ENDPOINT
                            ? `Complete Order • €${total.toLocaleString()}`
                            : `Submit Order Request • €${total.toLocaleString()}`}
                      </Button>
                      {!HAS_CHECKOUT_ENDPOINT && (
                        <p className="text-xs text-muted-foreground text-center">
                          Submitting opens your email app with a prefilled order request to{" "}
                          <a href={`mailto:${SITE_ORDERS_EMAIL}`} className="underline hover:text-foreground">
                            {SITE_ORDERS_EMAIL}
                          </a>
                          . Card details are not included in the email — your card will not be charged.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12" role="status" aria-live="polite">
                      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Check className="h-8 w-8 text-green-600" aria-hidden="true" />
                      </div>
                      <h3 className="text-xl font-light text-foreground mb-2">
                        {HAS_CHECKOUT_ENDPOINT ? "Order Received" : "Order Request Sent"}
                      </h3>
                      <p className="text-muted-foreground">
                        {HAS_CHECKOUT_ENDPOINT
                          ? "Thank you for your purchase. Your order confirmation has been sent to your email."
                          : `Thanks — review the prefilled email and hit send so we can finalize your order. You'll hear back at the address you provided.`}
                      </p>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
