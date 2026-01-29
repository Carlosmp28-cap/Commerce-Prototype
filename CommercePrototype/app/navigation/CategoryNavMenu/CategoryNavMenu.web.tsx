import React, { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Divider, Text, useTheme as usePaperTheme } from "react-native-paper";
import type { CategoryNodeDto } from "../../models";

import { styles } from "./CategoryNavMenu.styles";
import {
  getVisibleChildren,
  getVisibleTopCategories,
} from "./CategoryNavMenu.utils";

type Props = {
  categories: CategoryNodeDto[];
  onSelectCategory: (categoryId: string) => void;
};

export default function CategoryNavMenuWeb({
  categories,
  onSelectCategory,
}: Props) {
  const paperTheme = usePaperTheme();

  const visibleCategories = useMemo(
    () => getVisibleTopCategories(categories),
    [categories],
  );

  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hover stability: only close after leaving both top bar and dropdown.
  const isInsideTopRef = useRef(false);
  const isInsideDropdownRef = useRef(false);

  const activeParent = useMemo(() => {
    const byId = new Map(visibleCategories.map((c) => [c.id, c] as const));
    if (activeParentId && byId.has(activeParentId))
      return byId.get(activeParentId)!;
    return visibleCategories[0];
  }, [activeParentId, visibleCategories]);

  const activeChild = useMemo(() => {
    if (!activeParent || !activeChildId) return undefined;
    return getVisibleChildren(activeParent).find((c) => c.id === activeChildId);
  }, [activeParent, activeChildId]);

  const cancelCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleCloseIfOutside = () => {
    cancelCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      if (isInsideTopRef.current || isInsideDropdownRef.current) return;
      setMenuOpen(false);
      setActiveChildId(null);
    }, 450);
  };

  const openForParent = (parentId: string) => {
    cancelCloseTimer();
    setActiveParentId(parentId);
    setMenuOpen(true);
    setActiveChildId(null);
  };

  const selectAndClose = (categoryId: string) => {
    onSelectCategory(categoryId);
    setMenuOpen(false);
    setActiveChildId(null);
  };

  // DOM mouseenter/mouseleave are more stable than nested Pressable hover events.
  const webRegionHoverProps = {
    onMouseEnter: () => {
      isInsideTopRef.current = true;
      cancelCloseTimer();
    },
    onMouseLeave: () => {
      isInsideTopRef.current = false;
      scheduleCloseIfOutside();
    },
  } as any;

  const webDropdownHoverProps = {
    onMouseEnter: () => {
      isInsideDropdownRef.current = true;
      cancelCloseTimer();
    },
    onMouseLeave: () => {
      isInsideDropdownRef.current = false;
      scheduleCloseIfOutside();
    },
  } as any;

  return (
    <View style={styles.webRoot}>
      <View {...webRegionHoverProps} style={styles.webRegion}>
        <ScrollView
          style={styles.webTopScroll}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.webTopBar}
        >
          {visibleCategories.map((parent) => {
            const isActive = menuOpen && activeParent?.id === parent.id;
            return (
              <Pressable
                key={parent.id}
                accessibilityRole="button"
                accessibilityLabel={`Open ${parent.name} menu`}
                onHoverIn={() => {
                  isInsideTopRef.current = true;
                  openForParent(parent.id);
                }}
                onHoverOut={() => {
                  isInsideTopRef.current = false;
                  scheduleCloseIfOutside();
                }}
                onFocus={() => openForParent(parent.id)}
                onPress={() => openForParent(parent.id)}
                style={[
                  styles.webTopItem,
                  isActive ? styles.webTopItemActive : null,
                ]}
              >
                <Text
                  style={{
                    color: isActive
                      ? paperTheme.colors.primary
                      : paperTheme.colors.onSurface,
                  }}
                >
                  <Text style={styles.webTopItemText}>{parent.name}</Text>{" "}
                  <Text aria-hidden style={{ opacity: 0.7 }}>
                    {"▾"}
                  </Text>
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {menuOpen && activeParent ? (
          <View
            {...webDropdownHoverProps}
            style={[
              styles.webDropdown,
              {
                backgroundColor: paperTheme.colors.surface,
                borderColor: paperTheme.colors.outline ?? "#00000022",
              },
            ]}
          >
            <View style={styles.webDropdownColumn}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Show all ${activeParent.name}`}
                onPress={() => selectAndClose(activeParent.id)}
                style={styles.webDropdownRow}
              >
                <Text style={styles.webDropdownRowText}>
                  All {activeParent.name}
                </Text>
              </Pressable>

              <Divider />

              {getVisibleChildren(activeParent).map((child) => {
                const hasGrandChildren = !!(
                  child.children && child.children.length > 0
                );
                const isChildActive = activeChildId === child.id;

                return (
                  <Pressable
                    key={child.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Browse ${child.name}`}
                    onHoverIn={() => setActiveChildId(child.id)}
                    onFocus={() => setActiveChildId(child.id)}
                    onPress={() => selectAndClose(child.id)}
                    style={[
                      styles.webDropdownRow,
                      isChildActive
                        ? { backgroundColor: paperTheme.colors.surfaceVariant }
                        : null,
                    ]}
                  >
                    <Text style={styles.webDropdownRowText}>{child.name}</Text>
                    {hasGrandChildren ? (
                      <Text aria-hidden style={styles.webArrow}>
                        {"›"}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            {activeChild && (activeChild.children?.length ?? 0) > 0 ? (
              <View
                style={[
                  styles.webDropdownColumn,
                  styles.webDropdownColumnRight,
                ]}
              >
                {getVisibleChildren(activeChild).map((grandChild) => (
                  <Pressable
                    key={grandChild.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${grandChild.name}`}
                    onPress={() => selectAndClose(grandChild.id)}
                    style={styles.webDropdownRow}
                  >
                    <Text style={styles.webDropdownRowText}>
                      {grandChild.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
