import { memo } from "react";
import { View } from "react-native";
import { Icon, Text, useTheme as usePaperTheme } from "react-native-paper";

import { styles } from "./HomeValueProps.styles";

/**
 * Simple value proposition section (trust signals).
 *
 * Kept intentionally static and lightweight.
 */
function HomeValuePropsComponent({ title }: { title: string }) {
  const paperTheme = usePaperTheme();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.valueProps}>
        <View style={styles.valueProp}>
          <Icon
            source="truck-fast"
            size={18}
            color={paperTheme.colors.primary}
          />
          <Text style={styles.valuePropTitle}>Fast delivery</Text>
          <Text style={styles.valuePropBody}>Fulfilled in 24–48h</Text>
        </View>
        <View style={styles.valueProp}>
          <Icon
            source="shield-check"
            size={18}
            color={paperTheme.colors.primary}
          />
          <Text style={styles.valuePropTitle}>Secure checkout</Text>
          <Text style={styles.valuePropBody}>Trusted payments</Text>
        </View>
        <View style={styles.valueProp}>
          <Icon
            source="backup-restore"
            size={18}
            color={paperTheme.colors.primary}
          />
          <Text style={styles.valuePropTitle}>Easy returns</Text>
          <Text style={styles.valuePropBody}>30-day returns</Text>
        </View>
      </View>
    </View>
  );
}

export const HomeValueProps = memo(HomeValuePropsComponent);
