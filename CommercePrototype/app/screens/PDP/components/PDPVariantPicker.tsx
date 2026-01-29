import React from "react";
import { View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "../../../themes";
import Text from "../../../components/Text";
import type { Product } from "../../../models/Product";
import { styles } from "../PDP.styles";

type Props = {
  variants: Product["variants"];
  selectedVariantId: string | null;
  onSelect: (id: string | null) => void;
};

export default function PDPVariantPicker({
  variants,
  selectedVariantId,
  onSelect,
}: Props) {
  const theme = useTheme();

  if (!variants || variants.length === 0) return null;

  return (
    <View style={styles.variantDropdownContainer}>
      <Text
        style={{ color: theme.colors.text, fontWeight: "700", marginBottom: 8 }}
      >
        Choose variant
      </Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedVariantId ?? ""}
          onValueChange={(val) => onSelect(val || null)}
          accessibilityLabel="Select product variant"
        >
          <Picker.Item label="-- Select variant --" value="" />
          {variants.map((v) => {
            const label = v.variationValues
              ? Object.entries(v.variationValues)
                  .map(([k, val]) => `${k}: ${val}`)
                  .join(" • ")
              : v.id;
            const disabled = v.orderable === false;
            return (
              <Picker.Item
                key={v.id}
                label={disabled ? `${label} (unavailable)` : label}
                value={v.id}
                enabled={!disabled}
              />
            );
          })}
        </Picker>
      </View>
    </View>
  );
}
