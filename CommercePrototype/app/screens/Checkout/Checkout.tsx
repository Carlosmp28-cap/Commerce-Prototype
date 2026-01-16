import React, { Suspense, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Snackbar,
  Title,
  Paragraph,
  Button,
  Avatar,
  useTheme as usePaperTheme,
} from "react-native-paper";

import type { RootStackParamList } from "../../navigation";
import { useTheme } from "../../themes";
import styles from "./styles";

const ShippingForm = React.lazy(() => import("./components/ShippingForm"));
const PaymentForm = React.lazy(() => import("./components/PaymentForm"));
const ReviewCard = React.lazy(() => import("./components/ReviewCard"));
const OrderSummary = React.lazy(() => import("./components/OrderSummary"));

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export default function CheckoutScreen({ navigation }: Props) {
  const theme = useTheme();
  const paper = usePaperTheme();
  const { width } = useWindowDimensions();
  const isNarrow = width < 760;

  // steps
  const [step, setStep] = useState<number>(0);

  // shipping
  const [fullName, setFullName] = useState("");
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

  // cart (mock)
  const mockItems = [
    { id: "1", title: "T-Shirt", qty: 2, price: 19.99 },
    { id: "2", title: "Sneakers", qty: 1, price: 69.5 },
  ];

  const subtotal = React.useMemo(
    () => mockItems.reduce((s, it) => s + it.qty * it.price, 0),
    []
  );
  const shippingCost = 5.0;
  const total = subtotal + shippingCost;


  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  
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


  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const validateShipping = () =>
    Boolean(fullName.trim() && address.trim() && city.trim() && postalCode.trim());

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

  const next = () => {
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
  };

  const back = () => {
    if (step === 0) {
      navigation.goBack();
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  };

  const placeOrder = async () => {
    // simulate
    Keyboard.dismiss();
    setTimeout(() => navigation.goBack(), 900);
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
            <Suspense fallback={<View style={{ height: 200, justifyContent: "center" }}><ActivityIndicator /></View>}>
              {step === 0 && (
                <ShippingForm
                  fullName={fullName} setFullName={setFullName}
                  address={address} setAddress={setAddress}
                  city={city} setCity={setCity}
                  postalCode={postalCode} setPostalCode={setPostalCode}
                  country={country} countryQuery={countryQuery} setCountry={setCountry} setCountryQuery={setCountryQuery}
                  addressSuggestions={addressSuggestions} setAddressSuggestions={setAddressSuggestions}
                  showAddressSuggestions={showAddressSuggestions} setShowAddressSuggestions={setShowAddressSuggestions}
                  suggestionsLoading={suggestionsLoading} setSuggestionsLoading={setSuggestionsLoading}
                  debounceRef={debounceRef}
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
                  fullName={fullName} address={address} city={city} postalCode={postalCode} country={country}
                  paymentMethod={paymentMethod} cardName={cardName} cardNumber={cardNumber}
                  mockItems={mockItems} subtotal={subtotal} shippingCost={shippingCost} total={total}
                />
              )}
            </Suspense>

            <View style={styles.actions}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <ButtonCompact label="Back" onPress={back} />
              </View>
              <View style={{ flex: 1 }}>
                {step < 2 ? (
                  <ButtonCompact label="Next" onPress={next} primary />
                ) : (
                  <ButtonCompact label="Place order" onPress={placeOrder} primary />
                )}
              </View>
            </View>
          </View>

          {step !== 2 && (
            <View style={[styles.colSummary, isNarrow && styles.colSummaryNarrow]}>
              <OrderSummary mockItems={mockItems} subtotal={subtotal} shippingCost={shippingCost} total={total} />
            </View>
          )}
        </View>
      </ScrollView>

      <Snackbar visible={false} onDismiss={() => {}} duration={3000}> </Snackbar>
    </KeyboardAvoidingView>
  );
}

function ButtonCompact({ label, onPress, primary }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Button
      mode={primary ? "contained" : "outlined"}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {label}
    </Button>
  );
}
