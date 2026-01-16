import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Keyboard } from "react-native";
import { Card, TextInput, Text, Paragraph, ActivityIndicator } from "react-native-paper";
import styles from "../styles";

type MockAddress = { displayName: string; street?: string; city?: string; postcode?: string; country?: string };

export default function ShippingForm(props: {
  fullName: string; setFullName: (v: string) => void;
  address: string; setAddress: (v: string) => void;
  city: string; setCity: (v: string) => void;
  postalCode: string; setPostalCode: (v: string) => void;
  country: string; countryQuery: string; setCountry: (v: string) => void; setCountryQuery: (v: string) => void;
  addressSuggestions: MockAddress[]; setAddressSuggestions: (s: MockAddress[]) => void;
  showAddressSuggestions: boolean; setShowAddressSuggestions: (b: boolean) => void;
  suggestionsLoading: boolean; setSuggestionsLoading: (b: boolean) => void;
  debounceRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
}) {
  const {
    fullName, setFullName, address, setAddress, city, setCity, postalCode, setPostalCode,
    country, countryQuery, setCountry, setCountryQuery,
    addressSuggestions, showAddressSuggestions, suggestionsLoading, debounceRef, setAddressSuggestions, setShowAddressSuggestions
  } = props;

  // local matcher using the same mock set from Checkout (you can import mock list)
  const MOCK_ADDRESSES = [
    { displayName: "Praça do Comércio, 1100-148 Lisboa, Portugal", street: "Praça do Comércio", city: "Lisboa", postcode: "1100-148", country: "Portugal" },
    { displayName: "Rua de Santa Catarina 200, 4000-447 Porto, Portugal", street: "Rua de Santa Catarina 200", city: "Porto", postcode: "4000-447", country: "Portugal" },
    // ... keep small set
  ];

  const onAddressChange = (val: string) => {
    setAddress(val);
    setCity("");
    setPostalCode("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val || val.trim().length < 2) {
      setAddressSuggestions([]); setShowAddressSuggestions(false); return;
    }
    props.setSuggestionsLoading(true);
    debounceRef.current = setTimeout(() => {
      const q = val.trim().toLowerCase();
      const filtered = MOCK_ADDRESSES.filter(a => a.displayName.toLowerCase().includes(q) || (a.street ?? "").toLowerCase().includes(q)).slice(0, 6);
      setAddressSuggestions(filtered);
      setShowAddressSuggestions(filtered.length > 0);
      props.setSuggestionsLoading(false);
    }, 300);
  };

  const select = (s: MockAddress) => {
    setAddress(s.displayName); setCity(s.city ?? ""); setPostalCode(s.postcode ?? "");
    if (s.country) { setCountry(s.country); setCountryQuery(s.country); }
    setAddressSuggestions([]); setShowAddressSuggestions(false); Keyboard.dismiss();
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Shipping information</Text>
        <Paragraph style={styles.hint}>Enter the address where you want to receive the order.</Paragraph>

        <TextInput label="Full name" value={fullName} onChangeText={setFullName} mode="outlined" style={styles.input} />
        <TextInput label="Address" value={address} onChangeText={onAddressChange} mode="outlined" style={styles.input}
          right={ suggestionsLoading ? <TextInput.Icon name={() => <ActivityIndicator size={18} />} /> : undefined } />

        {showAddressSuggestions && addressSuggestions.length > 0 && (
          <Card style={styles.suggestionsCard}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {addressSuggestions.map((s, idx) => (
                <TouchableOpacity key={(s.displayName ?? "") + idx} onPress={() => select(s)}>
                  <View style={styles.suggestionItem}>
                    <Text numberOfLines={2}>{s.displayName}</Text>
                    <Paragraph style={styles.suggestionMeta}>{s.city ?? ""} {s.postcode ? `• ${s.postcode}` : ""}</Paragraph>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>
        )}

        <View style={styles.row}>
          <TextInput label="City" value={city} onChangeText={setCity} mode="outlined" style={[styles.input, { flex: 1, marginRight: 8 }]} />
          <TextInput label="Postal code" value={postalCode} onChangeText={setPostalCode} mode="outlined" style={[styles.input, { width: 140 }]} keyboardType="numeric" />
        </View>

        <TextInput label="Country" value={countryQuery || country} onChangeText={(t) => { setCountryQuery(t); setCountry(t); }} mode="outlined" style={styles.input} />
      </Card.Content>
    </Card>
  );
}