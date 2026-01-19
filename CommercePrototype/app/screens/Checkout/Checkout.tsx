import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Avatar,
  Button,
  Paragraph,
  Title,
  useTheme as usePaperTheme,
} from "react-native-paper";

import { useCart } from "../../hooks/useCart";
import type { RootStackParamList } from "../../navigation";
import { useTheme } from "../../themes";
import styles from "./styles";

import {
  OrderSummary,
  PaymentForm,
  ReviewCard,
  ShippingForm,
} from "./components";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export default function CheckoutScreen({ route, navigation }: Props) {
  const { items, totalPrice, totalQuantity } = useCart();
  const { totalTax } = route.params;

  // 1) Guard incoming params
  const safeItems = Array.isArray(items) ? items : [];

  console.log("Cart items (full):", JSON.stringify(safeItems, null, 2));

  // Debug – see what we actually received
  console.log("✅ Checkout params:", {
    itemsType: Array.isArray(items) ? "array" : typeof items,
    itemsLen: Array.isArray(items) ? items.length : undefined,
    totalPrice,
    totalQuantity,
  });

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

  // 4) Shipping and total (choose your source of truth)
  const shippingCost = 5.0;
  const total = totalTax + shippingCost;

  // Option B: trust numbers from Cart (coerce anyway)
  // const subtotal = safeSubtotalCart;
  // const total = safeTotalCart;

  // Debug – confirm computed numbers are valid
  console.log("🧮 Computed:", {
    totalPrice,
    shippingCost,
    total,
  });

  // suggestions (local mock logic moved to ShippingForm but parent keeps selected data)
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [placing, setPlacing] = useState(false);
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
      ensure(
        "og:description",
        "Finalizar encomenda — pagamento seguro e envio rápido."
      );
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

  // place order: finalize locally and navigate back
  const placeOrder = async () => {
    if (placing) return;
    setPlacing(true);
    try {
      Keyboard.dismiss();
      // simulate processing
      await new Promise((r) => setTimeout(r, 300));
      navigation.goBack();
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
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
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
            {step === 0 && (
              <ShippingForm
                fullName={fullName}
                setFullName={setFullName}
                email={email}
                setEmail={setEmail}
                address={address}
                setAddress={setAddress}
                city={city}
                setCity={setCity}
                postalCode={postalCode}
                setPostalCode={setPostalCode}
                country={country}
                countryQuery={countryQuery}
                setCountry={setCountry}
                setCountryQuery={setCountryQuery}
              />
            )}

            {step === 1 && (
              <PaymentForm
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cardName={cardName}
                setCardName={setCardName}
                cardNumber={cardNumber}
                setCardNumber={setCardNumber}
                expiry={expiry}
                setExpiry={setExpiry}
                cvv={cvv}
                setCvv={setCvv}
                cardNumberError={cardNumberError}
                setCardNumberError={setCardNumberError}
                expiryError={expiryError}
                setExpiryError={setExpiryError}
                cvvError={cvvError}
                setCvvError={setCvvError}
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
                items={items}
                subtotal={totalPrice}
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
          </View>

          {step !== 2 && (
            <View
              style={[styles.colSummary, isNarrow && styles.colSummaryNarrow]}
            >
              <OrderSummary
                items={items}
                subtotal={totalPrice}
                shippingCost={shippingCost}
                total={total}
                totalTax={totalTax}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
