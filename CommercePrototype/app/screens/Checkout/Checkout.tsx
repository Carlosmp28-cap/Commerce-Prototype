import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
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
  Snackbar,
  Title,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useCart } from "../../store/CartContext";

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

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const validateShipping = () =>
    Boolean(
      fullName.trim() && address.trim() && city.trim() && postalCode.trim()
    );

  const validatePayment = () => {
    if (paymentMethod === "paypal") return true;
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
    Keyboard.dismiss();
    setTimeout(() => navigation.goBack(), 900);
  };

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
            <Title style={{ color: paper.colors.onSurface }}>Checkout</Title>
            <Paragraph style={{ color: paper.colors.onSurfaceVariant }}>
              Complete your purchase — secure payment and fast delivery
            </Paragraph>
          </View>
          <Avatar.Text
            size={48}
            label="CP"
            style={{ backgroundColor: paper.colors.primary }}
          />
        </View>

        <View style={[styles.grid, isNarrow && styles.gridColumn]}>
          <View style={styles.colMain}>
            {step === 0 && (
              <ShippingForm
                fullName={fullName}
                setFullName={setFullName}
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
                addressSuggestions={addressSuggestions}
                setAddressSuggestions={setAddressSuggestions}
                showAddressSuggestions={showAddressSuggestions}
                setShowAddressSuggestions={setShowAddressSuggestions}
                suggestionsLoading={suggestionsLoading}
                setSuggestionsLoading={setSuggestionsLoading}
                debounceRef={debounceRef}
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
                <ButtonCompact label="Back" onPress={back} />
              </View>
              <View style={{ flex: 1 }}>
                {step < 2 ? (
                  <ButtonCompact label="Next" onPress={next} primary />
                ) : (
                  <ButtonCompact
                    label="Place order"
                    onPress={placeOrder}
                    primary
                  />
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

      <Snackbar visible={false} onDismiss={() => {}} duration={3000}>
        {" "}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

function ButtonCompact({
  label,
  onPress,
  primary,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Button mode={primary ? "contained" : "outlined"} onPress={onPress}>
      {label}
    </Button>
  );
}
