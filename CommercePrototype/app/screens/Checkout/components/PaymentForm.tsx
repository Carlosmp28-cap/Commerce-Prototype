import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, TextInput, Text, Paragraph, RadioButton } from "react-native-paper";
import styles from "../styles";


export default function PaymentForm(props: {
  paymentMethod: "card" | "paypal"; setPaymentMethod: (v: "card"|"paypal") => void;
  cardName: string; setCardName: (s:string)=>void;
  cardNumber: string; setCardNumber: (s:string)=>void;
  expiry: string; setExpiry: (s:string)=>void;
  cvv: string; setCvv: (s:string)=>void;
  cardNumberError: string; setCardNumberError: (s:string)=>void;
  expiryError: string; setExpiryError: (s:string)=>void;
  cvvError: string; setCvvError: (s:string)=>void;
}) {
  const { paymentMethod, setPaymentMethod, cardName, setCardName, cardNumber, setCardNumber, expiry, setExpiry, cvv, setCvv, cardNumberError, expiryError, cvvError } = props;

  const formatCardNumber = (digits: string) => digits.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();

  const onCardNumberChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 16);
    setCardNumber(digits);
  };

  const onExpiryChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) setExpiry(`${digits.slice(0,2)}/${digits.slice(2)}`);
    else if (digits.length >= 2) setExpiry(`${digits.slice(0,2)}` + (digits.length===2 ? "/" : ""));
    else setExpiry(digits);
  };

  const onCvvChange = (t: string) => setCvv(t.replace(/\D/g, "").slice(0,3));

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Payment method</Text>
        <Paragraph style={styles.hint}>Secure payment via card or PayPal.</Paragraph>

        <RadioButton.Group onValueChange={(v) => setPaymentMethod(v === "paypal" ? "paypal" : "card")} value={paymentMethod}>
          <View style={styles.radioRow}><RadioButton value="card" /><Text style={styles.radioLabel}>Credit / Debit Card</Text></View>
          <View style={styles.radioRow}><RadioButton value="paypal" /><Text style={styles.radioLabel}>PayPal</Text></View>
        </RadioButton.Group>

        {paymentMethod === "card" ? (
          <>
            <TextInput label="Name on card" value={cardName} onChangeText={setCardName} mode="outlined" style={styles.input} />
            <TextInput label="Card number" value={formatCardNumber(cardNumber)} onChangeText={onCardNumberChange} mode="outlined" style={styles.input} keyboardType="numeric" />
            {cardNumberError ? <Text style={{color:"red"}}>{cardNumberError}</Text> : null}
            <View style={styles.row}>
              <TextInput label="Expiry (MM/YY)" value={expiry} onChangeText={onExpiryChange} mode="outlined" style={[styles.input, {flex:1, marginRight:8}]} keyboardType="numeric" maxLength={5} />
              <TextInput label="CVV" value={cvv} onChangeText={onCvvChange} mode="outlined" style={[styles.input, {width:120}]} keyboardType="numeric" secureTextEntry maxLength={3} />
            </View>
            {expiryError ? <Text style={{color:"red"}}>{expiryError}</Text> : null}
            {cvvError ? <Text style={{color:"red"}}>{cvvError}</Text> : null}
            <Paragraph style={{ marginTop: 6, color: "#666" }}>Card will be charged after placing the order.</Paragraph>
          </>
        ) : (
          <Paragraph style={{ marginTop: 8 }}>You will be redirected to PayPal to complete the payment.</Paragraph>
        )}
      </Card.Content>
    </Card>
  );
}