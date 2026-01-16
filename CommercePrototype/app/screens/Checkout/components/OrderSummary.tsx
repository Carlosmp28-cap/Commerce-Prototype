import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, Divider, Paragraph } from "react-native-paper";
import styles from "../styles";

export default function OrderSummary({ mockItems, subtotal, shippingCost, total } : { mockItems:any[]; subtotal:number; shippingCost:number; total:number }) {
  return (
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
        <View style={styles.orderRow}><Text>Subtotal</Text><Text>${subtotal.toFixed(2)}</Text></View>
        <View style={styles.orderRow}><Text>Shipping</Text><Text>${shippingCost.toFixed(2)}</Text></View>
        <Divider style={{ marginVertical: 8 }} />
        <View style={styles.orderRow}><Text style={{ fontWeight: "700" }}>Total</Text><Text style={{ fontWeight: "700" }}>${total.toFixed(2)}</Text></View>
        <Paragraph style={{ marginTop: 12, color: "#666" }}>Free returns within 30 days • Secure payment</Paragraph>
      </Card.Content>
    </Card>
  );
}