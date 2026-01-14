import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
  useWindowDimensions,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Button,
  Text,
  TextInput,
  Card,
  Divider,
  Snackbar,
  Title,
  Paragraph,
  RadioButton,
  useTheme as usePaperTheme,
  ActivityIndicator,
  Avatar,
} from "react-native-paper";

import type { RootStackParamList } from "../navigation";
import { useTheme } from "../themes";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

type MockAddress = {
  displayName: string;
  street?: string;
  city?: string;
  postcode?: string;
  country?: string;
};

const MOCK_COUNTRIES = [
  { name: "Portugal", code: "PT" },
  { name: "Spain", code: "ES" },
  { name: "France", code: "FR" },
  { name: "Germany", code: "DE" },
  { name: "United Kingdom", code: "GB" },
];

const MOCK_ADDRESSES: MockAddress[] = [
  {
    displayName: "Praça do Comércio, 1100-148 Lisboa, Portugal",
    street: "Praça do Comércio",
    city: "Lisboa",
    postcode: "1100-148",
    country: "Portugal",
  },
  {
    displayName: "Avenida da Liberdade 100, 1250-001 Lisboa, Portugal",
    street: "Avenida da Liberdade 100",
    city: "Lisboa",
    postcode: "1250-001",
    country: "Portugal",
  },
  {
    displayName: "Rua de Santa Catarina 200, 4000-447 Porto, Portugal",
    street: "Rua de Santa Catarina 200",
    city: "Porto",
    postcode: "4000-447",
    country: "Portugal",
  },
  {
    displayName: "R. do Carmo 45, 1100-093 Lisboa, Portugal",
    street: "R. do Carmo 45",
    city: "Lisboa",
    postcode: "1100-093",
    country: "Portugal",
  },
  {
    displayName: "Praça da República, 3000-123 Coimbra, Portugal",
    street: "Praça da República",
    city: "Coimbra",
    postcode: "3000-123",
    country: "Portugal",
  },
  {
    displayName: "Av. dos Aliados 50, 4000-065 Porto, Portugal",
    street: "Av. dos Aliados 50",
    city: "Porto",
    postcode: "4000-065",
    country: "Portugal",
  },
];

export default function CheckoutScreen({ navigation }: Props) {
  const theme = useTheme();
  const paper = usePaperTheme();
  const { width } = useWindowDimensions();
  const isNarrow = width < 760;

  // step: 0 = Shipping, 1 = Payment, 2 = Review
  const [step, setStep] = useState<number>(0);

  // Shipping fields
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [countryQuery, setCountryQuery] = useState("");
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);

  // Payment fields
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">(
    "card"
  );

  // UI state
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");

  // mock cart
  const mockItems = [
    { id: "1", title: "T-Shirt", qty: 2, price: 19.99 },
    { id: "2", title: "Sneakers", qty: 1, price: 69.5 },
  ];
  const subtotal = mockItems.reduce((s, it) => s + it.qty * it.price, 0);
  const shippingCost = 5.0;
  const total = subtotal + shippingCost;

  // suggestions (local mocks)
  const [addressSuggestions, setAddressSuggestions] = useState<MockAddress[]>(
    []
  );
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const validateShipping = () =>
    Boolean(fullName.trim() && address.trim() && city.trim() && postalCode.trim());

  const validatePayment = () =>
    paymentMethod === "paypal" ||
    (cardName.trim() &&
      cardNumber.trim().length >= 12 &&
      expiry.trim() &&
      cvv.trim().length >= 3);

  const next = () => {
    if (step === 0) {
      if (!validateShipping()) {
        setSnackMessage("Please fill in required shipping fields.");
        setSnackbarVisible(true);
        return;
      }
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!validatePayment()) {
        setSnackMessage("Please fill in valid payment details.");
        setSnackbarVisible(true);
        return;
      }
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
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSnackMessage("Order placed successfully");
      setSnackbarVisible(true);
      setTimeout(() => navigation.goBack(), 900);
    }, 1000);
  };

  // local suggestion matcher (debounced)
  const onAddressChange = (val: string) => {
    setAddress(val);
    setCity("");
    setPostalCode("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val || val.trim().length < 2) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }
    setSuggestionsLoading(true);
    debounceRef.current = (setTimeout(() => {
      const q = val.trim().toLowerCase();
      const filtered = MOCK_ADDRESSES.filter((a) =>
        a.displayName.toLowerCase().includes(q) ||
        (a.street ?? "").toLowerCase().includes(q)
      ).slice(0, 6);
      setAddressSuggestions(filtered);
      setShowAddressSuggestions(filtered.length > 0);
      setSuggestionsLoading(false);
    }, 300) as unknown) as number;
  };

  const selectAddressSuggestion = (s: MockAddress) => {
    setAddress(s.displayName ?? address);
    setCity(s.city ?? "");
    setPostalCode(s.postcode ?? "");
    if (s.country) {
      setCountry(s.country);
      setCountryQuery(s.country);
    }
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
    Keyboard.dismiss();
  };

  const filteredCountries = React.useMemo(() => {
    const q = (countryQuery || country).toLowerCase();
    if (!q) return MOCK_COUNTRIES.slice(0, 6);
    return MOCK_COUNTRIES.filter((c) =>
      c.name.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [countryQuery, country]);

  // small helper for masked card number display
  const maskedCard = (num: string) =>
    num ? `${"•".repeat(Math.max(0, Math.max(0, num.length - 4)))}${num.slice(-4)}` : "";

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.content}>
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
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.sectionTitle}>Shipping information</Text>
                  <Paragraph style={styles.hint}>
                    Enter the address where you want to receive the order.
                  </Paragraph>

                  <TextInput
                    label="Full name"
                    value={fullName}
                    onChangeText={setFullName}
                    mode="outlined"
                    style={styles.input}
                    autoCapitalize="words"
                    placeholder="John Doe"
                  />

                  <TextInput
                    label="Address"
                    value={address}
                    onChangeText={onAddressChange}
                    onFocus={() => {
                      if (addressSuggestions.length > 0) setShowAddressSuggestions(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowAddressSuggestions(false), 150);
                    }}
                    mode="outlined"
                    style={styles.input}
                    right={
                      suggestionsLoading ? (
                        <TextInput.Icon name={() => <ActivityIndicator size={18} />} />
                      ) : undefined
                    }
                    placeholder="Street, number, neighbourhood..."
                  />

                  {showAddressSuggestions && addressSuggestions.length > 0 && (
                    <Card style={styles.suggestionsCard}>
                      <ScrollView keyboardShouldPersistTaps="handled">
                        {addressSuggestions.map((s, idx) => (
                          <TouchableOpacity
                            key={(s.displayName ?? "") + idx}
                            onPress={() => selectAddressSuggestion(s)}
                          >
                            <View style={styles.suggestionItem}>
                              <Text numberOfLines={2}>{s.displayName}</Text>
                              <Paragraph style={styles.suggestionMeta}>
                                {s.city ?? ""} {s.postcode ? `• ${s.postcode}` : ""}{" "}
                                {s.country ? `• ${s.country}` : ""}
                              </Paragraph>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </Card>
                  )}

                  <View style={styles.row}>
                    <TextInput
                      label="City"
                      value={city}
                      onChangeText={setCity}
                      mode="outlined"
                      style={[styles.input, { flex: 1, marginRight: 8 }]}
                    />
                    <TextInput
                      label="Postal code"
                      value={postalCode}
                      onChangeText={setPostalCode}
                      mode="outlined"
                      style={[styles.input, { width: 140 }]}
                      keyboardType="numeric"
                    />
                  </View>

                  <TextInput
                    label="Country"
                    value={countryQuery || country}
                    onChangeText={(t) => {
                      setCountryQuery(t);
                      setCountry(t);
                      setShowCountrySuggestions(true);
                    }}
                    onFocus={() => setShowCountrySuggestions(true)}
                    onBlur={() => {
                      setTimeout(() => setShowCountrySuggestions(false), 150);
                    }}
                    mode="outlined"
                    style={styles.input}
                  />

                  {showCountrySuggestions && filteredCountries.length > 0 && (
                    <Card style={styles.suggestionsCard}>
                      <ScrollView keyboardShouldPersistTaps="handled">
                        {filteredCountries.map((c) => (
                          <TouchableOpacity
                            key={c.code ?? c.name}
                            onPress={() => {
                              setCountry(c.name);
                              setCountryQuery(c.name);
                              setShowCountrySuggestions(false);
                            }}
                          >
                            <View style={styles.suggestionItem}>
                              <Text>{c.name}</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </Card>
                  )}
                </Card.Content>
              </Card>
            )}

            {step === 1 && (
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.sectionTitle}>Payment method</Text>
                  <Paragraph style={styles.hint}>
                    Secure payment via card or PayPal.
                  </Paragraph>

                  <RadioButton.Group
                    onValueChange={(val) =>
                      setPaymentMethod(val === "paypal" ? "paypal" : "card")
                    }
                    value={paymentMethod}
                  >
                    <View style={styles.radioRow}>
                      <RadioButton value="card" />
                      <Text style={styles.radioLabel}>Credit / Debit Card</Text>
                    </View>
                    <View style={styles.radioRow}>
                      <RadioButton value="paypal" />
                      <Text style={styles.radioLabel}>PayPal</Text>
                    </View>
                  </RadioButton.Group>

                  {paymentMethod === "card" ? (
                    <>
                      <TextInput
                        label="Name on card"
                        value={cardName}
                        onChangeText={setCardName}
                        mode="outlined"
                        style={styles.input}
                        placeholder="As written on card"
                      />
                      <TextInput
                        label="Card number"
                        value={cardNumber}
                        onChangeText={(t) => setCardNumber(t.replace(/\s/g, ""))}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="1234 5678 9012 3456"
                      />
                      <View style={styles.row}>
                        <TextInput
                          label="Expiry (MM/YY)"
                          value={expiry}
                          onChangeText={setExpiry}
                          mode="outlined"
                          style={[styles.input, { flex: 1, marginRight: 8 }]}
                        />
                        <TextInput
                          label="CVV"
                          value={cvv}
                          onChangeText={setCvv}
                          mode="outlined"
                          style={[styles.input, { width: 120 }]}
                          keyboardType="numeric"
                          secureTextEntry
                        />
                      </View>
                    </>
                  ) : (
                    <Paragraph style={{ marginTop: 8 }}>
                      You will be redirected to PayPal to complete the payment.
                    </Paragraph>
                  )}
                </Card.Content>
              </Card>
            )}

            {step === 2 && (
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.sectionTitle}>Review and confirm</Text>

                  <Text style={styles.subLabel}>Shipping</Text>
                  <Paragraph>{fullName}</Paragraph>
                  <Paragraph numberOfLines={2}>{address}</Paragraph>
                  <Paragraph>
                    {city} {postalCode} {country}
                  </Paragraph>

                  <Divider style={{ marginVertical: 12 }} />

                  <Text style={styles.subLabel}>Payment</Text>
                  <Paragraph>
                    {paymentMethod === "card"
                      ? `${cardName} • ${maskedCard(cardNumber)}`
                      : "PayPal"}
                  </Paragraph>

                  <Divider style={{ marginVertical: 12 }} />

                  <Text style={styles.subLabel}>Order summary</Text>
                  {mockItems.map((it) => (
                    <View key={it.id} style={styles.orderRow}>
                      <Text>{it.title} x{it.qty}</Text>
                      <Text>${(it.price * it.qty).toFixed(2)}</Text>
                    </View>
                  ))}
                  <Divider style={{ marginVertical: 8 }} />
                  <View style={styles.orderRow}>
                    <Text>Subtotal</Text>
                    <Text>${subtotal.toFixed(2)}</Text>
                  </View>
                  <View style={styles.orderRow}>
                    <Text>Shipping</Text>
                    <Text>${shippingCost.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.orderRow, { marginTop: 6 }]}>
                    <Text style={{ fontWeight: "700" }}>Total</Text>
                    <Text style={{ fontWeight: "700" }}>${total.toFixed(2)}</Text>
                  </View>
                </Card.Content>
              </Card>
            )}

            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={back}
                style={styles.actionButton}
                accessibilityLabel="Back"
              >
                Back
              </Button>

              {step < 2 ? (
                <Button
                  mode="contained"
                  onPress={next}
                  style={styles.actionButton}
                  accessibilityLabel="Next"
                  disabled={step === 0 ? !validateShipping() : step === 1 ? !validatePayment() : false}
                >
                  Next
                </Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={placeOrder}
                  loading={loading}
                  style={styles.actionButton}
                  accessibilityLabel="Place order"
                >
                  Place order
                </Button>
              )}
            </View>
          </View>

          <View style={[styles.colSummary, isNarrow && styles.colSummaryNarrow]}>
            <Card style={styles.summaryCard}>
              <Card.Title title="Order summary" subtitle={`${mockItems.length} items`} />
              <Card.Content>
                {mockItems.map((it) => (
                  <View key={it.id} style={styles.orderRow}>
                    <Text>{it.title} x{it.qty}</Text>
                    <Text>${(it.price * it.qty).toFixed(2)}</Text>
                  </View>
                ))}
                <Divider style={{ marginVertical: 8 }} />
                <View style={styles.orderRow}>
                  <Text>Subtotal</Text>
                  <Text>${subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.orderRow}>
                  <Text>Shipping</Text>
                  <Text>${shippingCost.toFixed(2)}</Text>
                </View>
                <Divider style={{ marginVertical: 8 }} />
                <View style={styles.orderRow}>
                  <Text style={{ fontWeight: "700" }}>Total</Text>
                  <Text style={{ fontWeight: "700" }}>${total.toFixed(2)}</Text>
                </View>
                <Paragraph style={{ marginTop: 12, color: paper.colors.onSurfaceVariant }}>
                  Free returns within 30 days • Secure payment
                </Paragraph>
              </Card.Content>
            </Card>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  grid: { flexDirection: "row" },
  gridColumn: { flexDirection: "column" },
  colMain: { flex: 1 },
  colSummary: { width: 320, marginLeft: 12 },
  colSummaryNarrow: { width: "100%", marginLeft: 0, marginTop: 8 },
  summaryCard: { marginTop: 6 },
  card: { marginVertical: 6 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  hint: { marginBottom: 8, color: "#666" },
  subLabel: { fontWeight: "600", marginTop: 6, marginBottom: 4 },
  input: { marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center" },
  radioRow: { flexDirection: "row", alignItems: "center" },
  radioLabel: { marginLeft: 4 },
  suggestionsCard: { marginHorizontal: 0, maxHeight: 200, marginTop: 8 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderColor: "#eee" },
  suggestionMeta: { fontSize: 12, color: "#666", marginTop: 4 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  actionButton: { flex: 1, marginHorizontal: 6 },
  orderRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 6 },
  title: { fontSize: 18, fontWeight: "900" },
  subtitle: { opacity: 0.8 },
});
