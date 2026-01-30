import { Pressable, ScrollView, View } from "react-native";
import {
  Chip,
  Divider,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";

import type { CategoryNodeDto } from "../../../../models";
import { isGiftCertificates } from "../../../../utils/categoryVisibility";

import { styles } from "./NestedCategoryPicker.styles";

type Props = {
  title: string;
  selectedLabel: string | undefined;
  visibleMainCategories: CategoryNodeDto[];
  activeParent: CategoryNodeDto | undefined;
  onActivateParent: (parentId: string) => void;
  onSelectCategory: (categoryId: string) => void;
};

export function NestedCategoryPickerNative({
  title,
  selectedLabel,
  visibleMainCategories,
  activeParent,
  onActivateParent,
  onSelectCategory,
}: Props) {
  const paperTheme = usePaperTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[styles.title, { color: paperTheme.colors.onSurfaceVariant }]}
      >
        {title}
      </Text>

      {selectedLabel ? (
        <Text
          style={[
            styles.selectedLabel,
            { color: paperTheme.colors.onSurfaceVariant },
          ]}
        >
          Selected: {selectedLabel}
        </Text>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.parentRow}
      >
        {visibleMainCategories.map((parent) => {
          const isActive = activeParent?.id === parent.id;
          return (
            <Pressable
              key={parent.id}
              accessibilityRole="button"
              accessibilityLabel={`Browse ${parent.name}`}
              onPress={() => onActivateParent(parent.id)}
              style={({ pressed }) => [
                styles.parentPill,
                {
                  backgroundColor: isActive
                    ? paperTheme.colors.primaryContainer
                    : paperTheme.colors.surface,
                  borderColor: isActive
                    ? paperTheme.colors.primary
                    : (paperTheme.colors.outline ?? paperTheme.colors.backdrop),
                },
                pressed ? { opacity: 0.9 } : null,
              ]}
            >
              <Text
                style={[
                  styles.parentPillText,
                  {
                    color: isActive
                      ? paperTheme.colors.onPrimaryContainer
                      : paperTheme.colors.onSurface,
                    fontWeight: isActive ? "700" : "600",
                  },
                ]}
              >
                {parent.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {activeParent ? (
        <View style={styles.nestedArea}>
          <View style={styles.rowTitleLine}>
            <Text style={styles.rowTitle}>Browse</Text>
            <Chip
              onPress={() => onSelectCategory(activeParent.id)}
              style={[
                styles.allChip,
                { backgroundColor: paperTheme.colors.surface },
              ]}
              textStyle={{
                color: paperTheme.colors.onSurface,
                fontWeight: "700",
              }}
              mode="outlined"
            >
              All {activeParent.name}
            </Chip>
          </View>

          <Divider />

          {/* 2nd-level categories (children of the active parent) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.childRow}
          >
            {(activeParent.children ?? [])
              .filter((c) => !isGiftCertificates(c.name))
              .map((child) => {
                const hasGrandChildren = !!(
                  child.children && child.children.length > 0
                );

                // If the child has its own children, selecting it should show everything under it.
                const label = hasGrandChildren
                  ? `All ${child.name}`
                  : child.name;

                return (
                  <Chip
                    key={child.id}
                    onPress={() => onSelectCategory(child.id)}
                    style={[
                      styles.childChip,
                      { backgroundColor: paperTheme.colors.surface },
                    ]}
                    textStyle={{
                      color: paperTheme.colors.onSurface,
                      fontWeight: "600",
                    }}
                    mode="outlined"
                  >
                    {label}
                  </Chip>
                );
              })}
          </ScrollView>

          {/* 3rd-level categories grouped under each 2nd-level category */}
          {(activeParent.children ?? [])
            .filter(
              (child) =>
                !isGiftCertificates(child.name) &&
                !!(child.children && child.children.length > 0),
            )
            .map((child) => (
              <View key={child.id} style={styles.groupBlock}>
                <Text
                  style={[
                    styles.groupTitle,
                    { color: paperTheme.colors.onSurface },
                  ]}
                >
                  {child.name}
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.grandChildRow}
                >
                  {(child.children ?? [])
                    .filter((gc) => !isGiftCertificates(gc.name))
                    .map((grandChild) => (
                      <Chip
                        key={grandChild.id}
                        onPress={() => onSelectCategory(grandChild.id)}
                        style={[
                          styles.grandChildChip,
                          { backgroundColor: paperTheme.colors.surface },
                        ]}
                        textStyle={{
                          color: paperTheme.colors.onSurface,
                          fontWeight: "600",
                        }}
                        mode="outlined"
                      >
                        {grandChild.name}
                      </Chip>
                    ))}
                </ScrollView>
              </View>
            ))}
        </View>
      ) : null}
    </View>
  );
}
