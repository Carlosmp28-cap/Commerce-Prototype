import React from "react";
import { View } from "react-native";
import type { Product } from "../../../models/Product";
import PDPProductInfoHeader from "./PDPProductInfoHeader";
import PDPProductInfoDetail from "./PDPProductInfoDetail";

interface PDPProductInfoProps {
  product: Product;
  isDesktop: boolean;
}

export default function PDPProductInfo({ product, isDesktop }: PDPProductInfoProps) {
  return (
    <View>
      <PDPProductInfoHeader product={product} isDesktop={isDesktop} />
      <PDPProductInfoDetail product={product} />
    </View>
  );
}
