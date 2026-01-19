import React from "react";
import { View } from "react-native";
import {
  TextInput,
  HelperText,
  Card,
  Paragraph,
  Text,
} from "react-native-paper";
import styles from "../styles";

export default function ShippingForm(props: {
  fullName: string;
  setFullName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  postalCode: string;
  setPostalCode: (v: string) => void;
  country: string;
  countryQuery: string;
  setCountry: (v: string) => void;
  setCountryQuery: (v: string) => void;
}) {
  const {
    fullName,
    setFullName,
    email,
    setEmail,
    address,
    setAddress,
    city,
    setCity,
    postalCode,
    setPostalCode,
    country,
    countryQuery,
    setCountry,
    setCountryQuery,
  } = props;

  const emailValid = (e: string) => /\S+@\S+\.\S+/.test(e);

  return (
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
          accessibilityLabel="Enter your full name"
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          accessibilityLabel="Email"
          style={styles.input}
        />
        <HelperText
          type={email && !emailValid(email) ? "error" : "info"}
          visible={!!email}
        >
          {email && !emailValid(email)
            ? "Insira um email válido."
            : "Usaremos este email para confirmação da encomenda."}
        </HelperText>

        <TextInput
          label="Address"
          value={address}
          onChangeText={setAddress}
          mode="outlined"
          style={styles.input}
          accessibilityLabel="Enter your address"
          autoComplete="off"
          autoCorrect={false}
          textContentType="fullStreetAddress"
        />

        <View style={styles.row}>
          <TextInput
            label="City"
            value={city}
            onChangeText={setCity}
            mode="outlined"
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            accessibilityLabel="Enter your city"
          />
          <TextInput
            label="Postal code"
            value={postalCode}
            onChangeText={setPostalCode}
            mode="outlined"
            style={[styles.input, { width: 140 }]}
            keyboardType="numeric"
            accessibilityLabel="Enter your postal code"
          />
        </View>

        <TextInput
          label="Country"
          value={countryQuery || country}
          onChangeText={(t) => {
            setCountryQuery(t);
            setCountry(t);
          }}
          mode="outlined"
          style={styles.input}
          accessibilityLabel="Enter your country"
        />
      </Card.Content>
    </Card>
  );
}
