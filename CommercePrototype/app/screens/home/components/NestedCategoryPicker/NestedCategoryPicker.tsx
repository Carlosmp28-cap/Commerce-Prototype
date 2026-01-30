import { memo, useMemo, useState } from "react";
import { Platform } from "react-native";
import type { CategoryNodeDto } from "../../../../models";

import { NestedCategoryPickerNative } from "./NestedCategoryPicker.Native";
import { NestedCategoryPickerWebMenu } from "./NestedCategoryPicker.WebMenu";
import {
  findCategoryLabelById,
  getActiveParentCategory,
  getVisibleMainCategories,
} from "./NestedCategoryPicker.utils";

interface NestedCategoryPickerProps {
  title: string;
  mainCategories: CategoryNodeDto[];
  onSelectCategory: (categoryId: string) => void;
  selectedCategoryId?: string;
}

/**
 * Nested category picker that shows main categories with expandable subcategories.
 * Users can click on main categories to see subcategories, or directly click subcategories.
 */
function NestedCategoryPickerComponent({
  title,
  mainCategories,
  onSelectCategory,
  selectedCategoryId,
}: NestedCategoryPickerProps) {
  const [activeParentId, setActiveParentId] = useState<string | null>(null);

  const visibleMainCategories = useMemo(
    () => getVisibleMainCategories(mainCategories),
    [mainCategories],
  );

  const selectedLabel = useMemo(
    () => findCategoryLabelById(visibleMainCategories, selectedCategoryId),
    [selectedCategoryId, visibleMainCategories],
  );

  // Default to the first category so users immediately see nested options.
  // Prefer keeping the current `activeParentId` if it still exists.
  const activeParent = useMemo(
    () => getActiveParentCategory(visibleMainCategories, activeParentId),
    [activeParentId, visibleMainCategories],
  );

  if (Platform.OS === "web") {
    return (
      <NestedCategoryPickerWebMenu
        title={title}
        selectedLabel={selectedLabel}
        visibleMainCategories={visibleMainCategories}
        activeParent={activeParent}
        onActivateParent={setActiveParentId}
        onSelectCategory={onSelectCategory}
      />
    );
  }

  return (
    <NestedCategoryPickerNative
      title={title}
      selectedLabel={selectedLabel}
      visibleMainCategories={visibleMainCategories}
      activeParent={activeParent}
      onActivateParent={setActiveParentId}
      onSelectCategory={onSelectCategory}
    />
  );
}

export const NestedCategoryPicker = memo(NestedCategoryPickerComponent);
