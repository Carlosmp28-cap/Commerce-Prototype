import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Keyboard,
  Alert,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Title, Paragraph, Button, Avatar, useTheme as usePaperTheme } from "react-native-paper";

import type { RootStackParamList } from "../../navigation";
import { useTheme } from "../../themes";
// use the same cart hook used in Cart screen
import { useCart } from "../../hooks/useCart";
import styles from "./styles";

import ShippingForm from "./components/ShippingForm";
import PaymentForm from "./components/PaymentForm";
import ReviewCard from "./components/ReviewCard";
import OrderSummary from "./components/OrderSummary";
import OrderSuccess from "./components/OrderSuccess";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export default function CheckoutScreen({ navigation, route }: Props) {
  // if cart items were passed from Cart screen use them, otherwise fallback to mock
  const routeItems = route?.params?.items;
  const defaultItems = [
    { id: "1", title: "T-Shirt", qty: 2, price: 19.99 },
    { id: "2", title: "Sneakers", qty: 1, price: 69.5 },
  ];
  // ensure mockItems is always an array (route params may provide a single object or non-array)
  const mockItems = React.useMemo(
    () => (Array.isArray(routeItems) && routeItems.length ? routeItems : defaultItems),
    [routeItems]
  );

  const subtotal = React.useMemo(
    () => mockItems.reduce((s, it) => s + it.qty * it.price, 0),
    [mockItems]
  );
  const shippingCost = 5.0;
  const total = React.useMemo(() => subtotal + shippingCost, [subtotal]);

  const theme = useTheme();
  const paper = usePaperTheme();
  const { width } = useWindowDimensions();
  const isNarrow = width < 760;

  // steps
  const [step, setStep] = useState<number>(0);

  // shipping
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [countryQuery, setCountryQuery] = useState("");

  // payment
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");

  // errors
  const [cardNumberError, setCardNumberError] = useState("");
  const [expiryError, setExpiryError] = useState("");
  const [cvvError, setCvvError] = useState("");

  // envio de email removido — estado relacionado eliminado
  const [placing, setPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = "Checkout — CommercePrototype";

      let meta = document.querySelector("meta[name='description']");
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute(
        "content",
        "Finalizar encomenda — pagamento seguro e envio rápido."
      );

      const ensure = (name: string, content: string) => {
        let tag = document.querySelector(`meta[property='${name}']`);
        if (!tag) {
          tag = document.createElement("meta");
          tag.setAttribute("property", name);
          document.head.appendChild(tag);
        }
        tag.setAttribute("content", content);
      };

      ensure("og:title", "Checkout — CommercePrototype");
      ensure("og:description", "Finalizar encomenda — pagamento seguro e envio rápido.");
    }
  }, []);

  const validateShipping = () => {
    const basicEmailValid = (e: string) => /\S+@\S+\.\S+/.test(e);
    return Boolean(
      fullName.trim() &&
      address.trim() &&
      city.trim() &&
      postalCode.trim() &&
      basicEmailValid(email)
    );
  };

  const validatePayment = () => {
    if (paymentMethod === "paypal") return true;
    // basic checks (detailed validators can be moved to helpers)
    return Boolean(
      cardName.trim() &&
      cardNumber.length >= 12 &&
      expiry.length === 5 &&
      cvv.length === 3
    );
  };

  // desativa Next até o step atual estar válido
  const isNextDisabled = (() => {
    if (step === 0) return !validateShipping();
    if (step === 1) return !validatePayment();
    return false;
  })();

  const next = useCallback(() => {
    if (step === 0) {
      if (!validateShipping()) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!validatePayment()) return;
      setStep(2);
      return;
    }
  }, [step, validateShipping, validatePayment]);

  const back = useCallback(() => {
    if (step === 0) {
      navigation.goBack();
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  }, [step, navigation]);

  // access cart actions (matches hook used in Cart.tsx)
  const { clearCart, items: cartItems = [], removeItem } = useCart() as any;

  // place order: finalize locally and navigate back
  const placeOrder = async () => {
    if (placing) return;
    setPlacing(true);
    try {
      Keyboard.dismiss();
      // simulate processing
      await new Promise((r) => setTimeout(r, 300));

      // clear cart: prefer clearCart if provided by hook, otherwise remove items one-by-one
      if (typeof clearCart === "function") {
        clearCart();
      } else if (Array.isArray(cartItems) && typeof removeItem === "function") {
        cartItems.forEach((ci: any) => {
          if (ci?.product?.id) removeItem(ci.product.id);
        });
      }

      // simulate order id from backend and show inline success component
      const fakeOrderId = `CP-${Date.now().toString(36).slice(-6).toUpperCase()}`;
      setOrderId(fakeOrderId);
      setOrderPlaced(true);
    } finally {
      setPlacing(false);
    }
  };

  useEffect(() => {
    // Add page visibility handlers only on web where window.events are meaningful.
    if (typeof window === "undefined" || !window.addEventListener) return;
    const onPageShow = (e: any) => {
      // restore state if persisted in bfcache
      if (e?.persisted) {
        // TODO: restore any transient UI state if needed
      }
    };
    const onPageHide = () => {
      // TODO: save transient state if needed
    };
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.select({ ios: "padding", android: "height" })}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Title
              style={{ color: paper.colors.onSurface }}
              accessibilityRole="header"
              accessibilityLabel="Checkout page title"
            >
              Checkout
            </Title>
            <Paragraph
              style={{ color: paper.colors.onSurfaceVariant }}
              accessibilityLabel="Checkout subtitle"
            >
              Complete your purchase — secure payment and fast delivery
            </Paragraph>
          </View>
          <Avatar.Text
            size={48}
            label="CP"
            style={{ backgroundColor: paper.colors.primary }}
            accessibilityLabel="Commerce Prototype logo"
            accessibilityRole="image"
          />
        </View>

        <View style={[styles.grid, isNarrow && styles.gridColumn]}>
          <View style={styles.colMain}>
            {orderPlaced ? (
              <OrderSuccess
                orderId={orderId}
                onReturnHome={() => {
                  // reset stack and go home
                  navigation.popToTop();
                  navigation.navigate("Home");
                }}
              />
            ) : (
              <>
                {step === 0 && (
                  <ShippingForm
                    fullName={fullName} setFullName={setFullName}
                    email={email} setEmail={setEmail}
                    address={address} setAddress={setAddress}
                    city={city} setCity={setCity}
                    postalCode={postalCode} setPostalCode={setPostalCode}
                    country={country} countryQuery={countryQuery} setCountry={setCountry} setCountryQuery={setCountryQuery}
                  />
                )}

                {step === 1 && (
                  <PaymentForm
                    paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                    cardName={cardName} setCardName={setCardName}
                    cardNumber={cardNumber} setCardNumber={setCardNumber}
                    expiry={expiry} setExpiry={setExpiry}
                    cvv={cvv} setCvv={setCvv}
                    cardNumberError={cardNumberError} setCardNumberError={setCardNumberError}
                    expiryError={expiryError} setExpiryError={setExpiryError}
                    cvvError={cvvError} setCvvError={setCvvError}
                  />
                )}

                {step === 2 && (
                  <ReviewCard
                    fullName={fullName}
                    email={email}
                    address={address}
                    city={city}
                    postalCode={postalCode}
                    country={country}
                    paymentMethod={paymentMethod}
                    cardName={cardName}
                    cardNumber={cardNumber}
                    mockItems={mockItems}
                    subtotal={subtotal}
                    shippingCost={shippingCost}
                    total={total}
                  />
                )}

                <View style={styles.actions}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Button
                      mode="outlined"
                      onPress={back}
                      accessibilityRole="button"
                      accessibilityLabel="Back"
                      disabled={false}
                      accessibilityState={{ disabled: false }}
                    >
                      Back
                    </Button>
                  </View>

                  <View style={{ flex: 1 }}>
                    {step < 2 ? (
                      <Button
                        mode="contained"
                        onPress={next}
                        disabled={!!isNextDisabled}
                        accessibilityRole="button"
                        accessibilityLabel="Next"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        mode="contained"
                        onPress={placeOrder}
                        accessibilityRole="button"
                        accessibilityLabel="Place order"
                      >
                        Place order
                      </Button>
                    )}
                  </View>
                </View>
              </>
            )}
          </View>

          {!orderPlaced && step !== 2 && (
            <View style={[styles.colSummary, isNarrow && styles.colSummaryNarrow]}>
              <OrderSummary mockItems={mockItems} subtotal={subtotal} shippingCost={shippingCost} total={total} />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
