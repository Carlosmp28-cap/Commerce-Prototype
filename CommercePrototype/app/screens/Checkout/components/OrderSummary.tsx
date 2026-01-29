import { View, type ImageSourcePropType } from "react-native";
import { Card, Divider, Paragraph, Text } from "react-native-paper";
import styles from "../styles";
import type { CartItem } from "../../../types";

// Compatibility alias for older tests/components importing `CartLine`
export type CartLine = CartItem;

// Matches your current cart item structure:
// { product: { id, name, price, ... }, quantity: number }

export default function OrderSummary({
  items,
  subtotal, // Keep total price without tax just in case
  shippingCost,
  total,
  totalTax,
}: {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  totalTax: number;
}) {
  // Optional debug (comment out if noisy)
  try {
    console.log(
      "🧾 OrderSummary items sample:",
      JSON.stringify(items.slice(0, 3), null, 2),
    );
  } catch {}

  return (
    <Card style={styles.summaryCard}>
      <Card.Title title="Order summary" subtitle={`${items.length} items`} />
      <Card.Content>
        {items.map((line, idx) => {
          const id = line?.product?.id ?? `line-${idx}`;
          const name = line?.product?.name ?? "Product";
          const unitPrice = Number(line?.product?.price ?? 0);
          const qty = Number(line?.quantity ?? 0);
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
          <Text>${Number(totalTax || 0).toFixed(2)}</Text>
        </View>

        <View style={styles.orderRow}>
          <Text>Shipping</Text>
          <Text>${Number(shippingCost || 0).toFixed(2)}</Text>
        </View>

        <Divider style={{ marginVertical: 8 }} />

        <View style={styles.orderRow}>
          <Text style={{ fontWeight: "700" }}>Total</Text>
          <Text style={{ fontWeight: "700" }}>
            ${Number(total || 0).toFixed(2)}
          </Text>
        </View>

        <Paragraph style={{ marginTop: 12, color: "#666" }}>
          Free returns within 30 days • Secure payment
        </Paragraph>
      </Card.Content>
    </Card>
  );
}
``;
