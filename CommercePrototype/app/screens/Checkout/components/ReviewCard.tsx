import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Divider, Paragraph } from "react-native-paper";
import styles from "../styles";

export default function ReviewCard(props: {
  fullName:string; address:string; city:string; postalCode:string; country:string;
  paymentMethod:string; cardName:string; cardNumber:string;
  mockItems:any[]; subtotal:number; shippingCost:number; total:number;
}) {
  const { fullName, address, city, postalCode, country, paymentMethod, cardName, cardNumber, mockItems, subtotal, shippingCost, total } = props;
  const masked = (n:string) => n ? `•`.repeat(Math.max(0, n.length-4)) + n.slice(-4) : "";
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Review and confirm</Text>
        <Text style={styles.subLabel}>Shipping</Text>
        <Paragraph>{fullName}</Paragraph>
        <Paragraph numberOfLines={2}>{address}</Paragraph>
        <Paragraph>{city} {postalCode} {country}</Paragraph>

        <Divider style={{marginVertical:12}}/>

        <Text style={styles.subLabel}>Payment</Text>
        <Paragraph>{paymentMethod === "card" ? `${cardName} • ${masked(cardNumber)}` : "PayPal"}</Paragraph>

        <Divider style={{marginVertical:12}}/>

        <Text style={styles.subLabel}>Order summary</Text>
        {mockItems.map(it => <View key={it.id} style={styles.orderRow}><Text>{it.title} x{it.qty}</Text><Text>${(it.price*it.qty).toFixed(2)}</Text></View>)}
        <Divider style={{marginVertical:8}} />
        <View style={styles.orderRow}><Text>Subtotal</Text><Text>${subtotal.toFixed(2)}</Text></View>
        <View style={styles.orderRow}><Text>Shipping</Text><Text>${shippingCost.toFixed(2)}</Text></View>
        <View style={[styles.orderRow,{marginTop:6}]}><Text style={{fontWeight:"700"}}>Total</Text><Text style={{fontWeight:"700"}}>${total.toFixed(2)}</Text></View>
      </Card.Content>
    </Card>
  );
}