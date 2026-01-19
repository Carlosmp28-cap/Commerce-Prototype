import { View } from "react-native";
import { Card, Divider, Paragraph, Text } from "react-native-paper";
import styles from "../styles";

type LineWithProduct = {
  product: { id: string | number; name: string; price: number };
  quantity: number;
};

type FlatLine = {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
};

type CartLine = LineWithProduct | FlatLine;

function getLineId(line: CartLine, idx: number) {
  if ("product" in line) return line.product?.id ?? `line-${idx}`;
  return (line as FlatLine).id ?? `line-${idx}`;
}

function getLineName(line: CartLine) {
  if ("product" in line) return line.product?.name ?? "Product";
  return (line as FlatLine).name ?? "Product";
}

function getLineUnitPrice(line: CartLine) {
  if ("product" in line) return Number(line.product?.price ?? 0);
  return Number((line as FlatLine).price ?? 0);
}

function getLineQty(line: CartLine) {
  if ("product" in line) return Number(line.quantity ?? 0);
  return Number((line as FlatLine).quantity ?? 0);
}

export default function ReviewCard(props: {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  cardName: string;
  cardNumber: string;
  items: CartLine[]; // <-- changed from mockItems:any[]
  subtotal: number;
  shippingCost: number;
  total: number;
}) {
  const {
    fullName,
    address,
    city,
    postalCode,
    country,
    paymentMethod,
    cardName,
    cardNumber,
    items,
    subtotal,
    shippingCost,
    total,
  } = props;

  const masked = (n: string) =>
    n ? "•".repeat(Math.max(0, n.length - 4)) + n.slice(-4) : "";

  return (
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
            ? `${cardName} • ${masked(cardNumber)}`
            : "PayPal"}
        </Paragraph>

        <Divider style={{ marginVertical: 12 }} />

        <Text style={styles.subLabel}>Order summary</Text>

        {items.map((line, idx) => {
          const id = getLineId(line, idx);
          const name = getLineName(line);
          const unitPrice = getLineUnitPrice(line);
          const qty = getLineQty(line);
          const lineTotal = unitPrice * qty;

          return (
            <View key={String(id)} style={styles.orderRow}>
              <Text>
                {name} x{qty}
              </Text>
              <Text>${lineTotal.toFixed(2)}</Text>
            </View>
          );
        })}

        <Divider style={{ marginVertical: 8 }} />

        <View style={styles.orderRow}>
          <Text>Subtotal</Text>
          <Text>${Number(subtotal || 0).toFixed(2)}</Text>
        </View>

        <View style={styles.orderRow}>
          <Text>Shipping</Text>
          <Text>${Number(shippingCost || 0).toFixed(2)}</Text>
        </View>

        <View style={[styles.orderRow, { marginTop: 6 }]}>
          <Text style={{ fontWeight: "700" }}>Total</Text>
          <Text style={{ fontWeight: "700" }}>
            ${Number(total || 0).toFixed(2)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}
