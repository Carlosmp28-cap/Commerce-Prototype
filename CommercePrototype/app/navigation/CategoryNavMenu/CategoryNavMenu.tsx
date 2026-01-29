import React from "react";
import { Platform } from "react-native";
import type { CategoryNodeDto } from "../../models";

import CategoryNavMenuWeb from "./CategoryNavMenu.web";
import CategoryNavMenuNative from "./CategoryNavMenu.native";

type Props = {
  categories: CategoryNodeDto[];
  onSelectCategory: (categoryId: string) => void;
};

export default function CategoryNavMenu(props: Props) {
  return Platform.OS === "web" ? (
    <CategoryNavMenuWeb {...props} />
  ) : (
    <CategoryNavMenuNative {...props} />
  );
}
