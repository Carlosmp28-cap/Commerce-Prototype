import React from "react";
import { StyleSheet, View } from "react-native";
import { Icon, Text, useTheme as usePaperTheme } from "react-native-paper";

export function HomeValueProps({ title }: { title: string }) {
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

const styles = StyleSheet.create({
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },
  valueProps: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  valueProp: {
    width: "31%",
    minWidth: 160,
    gap: 4,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.65)",
  },
  valuePropTitle: { fontWeight: "900" },
  valuePropBody: { opacity: 0.75, fontSize: 12 },
});
