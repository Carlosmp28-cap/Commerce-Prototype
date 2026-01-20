import { memo } from "react";
import { View } from "react-native";
import {
  Card,
  Icon,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";

import { styles } from "./HomePromos.styles";

/**
 * Promotional tiles used on Home.
 *
 * `layout` allows the same component to render as a row (mobile) or column (desktop web).
 */
function HomePromosComponent({
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
            <Text variant="titleMedium" style={styles.promoTitle}>
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
            <Text variant="titleMedium" style={styles.promoTitle}>
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

export const HomePromos = memo(HomePromosComponent);
