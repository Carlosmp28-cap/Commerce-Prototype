import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Divider, Text, useTheme as usePaperTheme } from "react-native-paper";

import type { CategoryNodeDto } from "../../../../services/api.types";
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

export function NestedCategoryPickerWebMenu({
  title,
  selectedLabel,
  visibleMainCategories,
  activeParent,
  onActivateParent,
  onSelectCategory,
}: Props) {
  const paperTheme = usePaperTheme();

  const [webMenuOpen, setWebMenuOpen] = useState(false);
  const [webActiveChildId, setWebActiveChildId] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const webActiveChild = useMemo(() => {
    if (!activeParent || !webActiveChildId) return undefined;
    return (activeParent.children ?? []).find((c) => c.id === webActiveChildId);
  }, [activeParent, webActiveChildId]);

  const cancelCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setWebMenuOpen(false);
      setWebActiveChildId(null);
    }, 180);
  };

  const openWebMenuForParent = (parentId: string) => {
    cancelCloseTimer();
    onActivateParent(parentId);
    setWebMenuOpen(true);
    setWebActiveChildId(null);
  };

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

      <Pressable
        style={styles.webMenuRoot}
        onHoverIn={cancelCloseTimer}
        onHoverOut={scheduleClose}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.webTopBar}
        >
          {visibleMainCategories.map((parent) => {
            const isActive = activeParent?.id === parent.id && webMenuOpen;

            return (
              <Pressable
                key={parent.id}
                accessibilityRole="button"
                accessibilityLabel={`Open ${parent.name} menu`}
                onHoverIn={() => openWebMenuForParent(parent.id)}
                onFocus={() => openWebMenuForParent(parent.id)}
                onPress={() => openWebMenuForParent(parent.id)}
                style={[
                  styles.webTopItem,
                  {
                    backgroundColor: isActive
                      ? paperTheme.colors.primary
                      : paperTheme.colors.surface,
                    borderColor: paperTheme.colors.outline ?? "#00000022",
                  },
                ]}
              >
                <Text
                  style={{
                    color: isActive
                      ? paperTheme.colors.onPrimary
                      : paperTheme.colors.onSurface,
                    fontWeight: 700,
                  }}
                >
                  {parent.name} <Text aria-hidden>{"▾"}</Text>
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {webMenuOpen && activeParent ? (
          <Pressable
            style={[
              styles.webDropdown,
              {
                backgroundColor: paperTheme.colors.surface,
                borderColor: paperTheme.colors.outline ?? "#00000022",
              },
            ]}
            onHoverIn={cancelCloseTimer}
            onHoverOut={scheduleClose}
          >
            <View style={styles.webDropdownColumn}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Show all ${activeParent.name}`}
                onPress={() => onSelectCategory(activeParent.id)}
                style={styles.webDropdownRow}
              >
                <Text style={styles.webDropdownRowText}>
                  All {activeParent.name}
                </Text>
              </Pressable>

              <Divider />

              {(activeParent.children ?? [])
                .filter((c) => !isGiftCertificates(c.name))
                .map((child) => {
                  const hasGrandChildren = !!(
                    child.children && child.children.length > 0
                  );
                  const isChildActive = webActiveChildId === child.id;

                  return (
                    <Pressable
                      key={child.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Browse ${child.name}`}
                      onHoverIn={() => setWebActiveChildId(child.id)}
                      onFocus={() => setWebActiveChildId(child.id)}
                      onPress={() => onSelectCategory(child.id)}
                      style={[
                        styles.webDropdownRow,
                        isChildActive
                          ? {
                              backgroundColor: paperTheme.colors.surfaceVariant,
                            }
                          : null,
                      ]}
                    >
                      <Text style={styles.webDropdownRowText}>
                        {child.name}
                      </Text>
                      {hasGrandChildren ? (
                        <Text aria-hidden style={styles.webArrow}>
                          {"›"}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
            </View>

            {webActiveChild && (webActiveChild.children?.length ?? 0) > 0 ? (
              <View
                style={[
                  styles.webDropdownColumn,
                  styles.webDropdownColumnRight,
                ]}
              >
                {(webActiveChild.children ?? [])
                  .filter((gc) => !isGiftCertificates(gc.name))
                  .map((grandChild) => (
                    <Pressable
                      key={grandChild.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${grandChild.name}`}
                      onPress={() => onSelectCategory(grandChild.id)}
                      style={styles.webDropdownRow}
                    >
                      <Text style={styles.webDropdownRowText}>
                        {grandChild.name}
                      </Text>
                    </Pressable>
                  ))}
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </Pressable>
    </View>
  );
}
