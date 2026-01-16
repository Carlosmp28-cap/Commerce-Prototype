import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Card,
  Icon,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";

export function HomePromos({
  onShopNew,
  onShopSale,
  layout = "row",
}: {
  onShopNew: () => void;
  onShopSale: () => void;
  layout?: "row" | "column";
}) {
  const paperTheme = usePaperTheme();

  return (
    <View
      style={[
        styles.promoRow,
        layout === "column" ? styles.promoRowColumn : null,
      ]}
    >
      <Card
        style={[
          styles.promoCard,
          { backgroundColor: paperTheme.colors.surface },
        ]}
        onPress={onShopNew}
        accessibilityLabel="Shop new arrivals"
      >
        <Card.Content style={styles.promoContent}>
          <View style={styles.promoTitleRow}>
            <Icon
              source="star-four-points"
              size={18}
              color={paperTheme.colors.primary}
            />
            <Text variant="titleMedium" style={{ fontWeight: "900" }}>
              New arrivals
            </Text>
          </View>
          <Text style={styles.promoSubtitle}>Fresh drops for the week</Text>
          <Text style={[styles.promoCta, { color: paperTheme.colors.primary }]}>
            Shop now
          </Text>
        </Card.Content>
      </Card>

      <Card
        style={[
          styles.promoCard,
          { backgroundColor: paperTheme.colors.surface },
        ]}
        onPress={onShopSale}
        accessibilityLabel="Shop sale"
      >
        <Card.Content style={styles.promoContent}>
          <View style={styles.promoTitleRow}>
            <Icon source="tag" size={18} color={paperTheme.colors.primary} />
            <Text variant="titleMedium" style={{ fontWeight: "900" }}>
              Sale
            </Text>
          </View>
          <Text style={styles.promoSubtitle}>Limited time offers</Text>
          <Text style={[styles.promoCta, { color: paperTheme.colors.primary }]}>
            View deals
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  promoRow: { flexDirection: "row", gap: 12 },
  promoRowColumn: { flexDirection: "column" },
  promoCard: { flex: 1, borderRadius: 14 },
  promoContent: { gap: 6, paddingTop: 14 },
  promoTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  promoSubtitle: { opacity: 0.75 },
  promoCta: { fontWeight: "900", marginTop: 4 },
});
