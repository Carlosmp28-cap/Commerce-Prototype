import { StyleSheet, View } from "react-native";
import {
  Card,
  Divider,
  Paragraph,
  Text,
  Title,
  useTheme,
} from "react-native-paper";

type Item = { id: string; title: string; qty: number; price: number };

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
  email?: string;
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
    email,
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

  const theme = useTheme();

  const renderLine = (line: CartLine, idx: number) => {
    const id = getLineId(line, idx);
    const title = getLineName(line);
    const qty = getLineQty(line);
    const unitPrice = getLineUnitPrice(line);
    const lineTotal = qty * unitPrice;

    const maskedCard = cardNumber ? `•••• ${cardNumber.slice(-4)}` : "";

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Review order</Title>

          <Paragraph style={styles.sectionLabel}>Shipping</Paragraph>
          <View style={styles.block}>
            <Text style={styles.blockLine}>{fullName}</Text>
            {email ? <Text style={styles.muted}>{email}</Text> : null}
            <Text style={styles.blockLine}>{address}</Text>
            <Text style={styles.blockLine}>
              {city} {postalCode}
            </Text>
            <Text style={styles.blockLine}>{country}</Text>
          </View>

          <Divider style={styles.divider} />

          <Paragraph style={styles.sectionLabel}>Payment</Paragraph>
          <View style={styles.block}>
            <Text style={styles.blockLine}>
              {paymentMethod === "card"
                ? `Card • ${cardName ?? ""} • ${maskedCard}`
                : "PayPal"}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <Paragraph style={styles.sectionLabel}>Items</Paragraph>
          <View style={styles.items}>{items.map(renderLine)}</View>

          <Divider style={[styles.divider, { marginTop: 10 }]} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{subtotal.toFixed(2)} €</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>{shippingCost.toFixed(2)} €</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text
              style={[styles.totalLabel, { color: theme.colors.onSurface }]}
            >
              Total
            </Text>
            <Text
              style={[styles.totalValue, { color: theme.colors.onSurface }]}
            >
              {total.toFixed(2)} €
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const styles = StyleSheet.create({
    card: {
      marginBottom: 12,
      borderRadius: 8,
      elevation: 2,
    },
    title: {
      marginBottom: 6,
    },
    sectionLabel: {
      marginTop: 6,
      marginBottom: 6,
      fontWeight: "600",
      color: "#444",
    },
    block: {
      marginBottom: 6,
      paddingVertical: 4,
    },
    blockLine: {
      marginBottom: 2,
    },
    muted: {
      color: "#666",
      marginBottom: 4,
    },
    divider: {
      marginVertical: 8,
    },
    items: {
      marginBottom: 8,
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: "#eee",
    },
    itemTitle: {
      flex: 1,
    },
    itemPrice: {
      marginLeft: 12,
      width: 80,
      textAlign: "right",
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 6,
    },
    summaryLabel: {
      color: "#444",
    },
    summaryValue: {
      color: "#444",
    },
    totalRow: {
      marginTop: 6,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "#ddd",
      paddingTop: 8,
    },
    totalLabel: {
      fontWeight: "700",
    },
    totalValue: {
      fontWeight: "700",
    },
  });
}
