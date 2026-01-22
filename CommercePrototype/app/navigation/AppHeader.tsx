import React, { useMemo } from "react";
import { Platform, View } from "react-native";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { IconButton, useTheme as usePaperTheme } from "react-native-paper";

import type { RootStackParamList } from "./index";
import { HeaderActions, HeaderHomeButton } from "./index";
import type { CategoryNodeDto } from "../services/api.types";
import CategoryNavMenu from "./CategoryNavMenu/index";
import { styles } from "./AppHeader.styles.ts";

type Props = NativeStackHeaderProps & {
  mainCategories: CategoryNodeDto[];
};

export default function AppHeader(props: Props) {
  const paperTheme = usePaperTheme();
  const { navigation, route } = props;

  const showSecondaryMenu = route.name !== "Checkout";

  const canGoBack = useMemo(() => {
    try {
      return navigation.canGoBack();
    } catch {
      return false;
    }
  }, [navigation]);

  return (
    <View
      style={[styles.root, { backgroundColor: paperTheme.colors.background }]}
    >
      <View style={styles.topRow}>
        <View style={styles.left}>
          {canGoBack && route.name !== "Home" ? (
            <IconButton
              icon="arrow-left"
              size={Platform.OS === "web" ? 22 : 24}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Back"
            />
          ) : null}
        </View>

        <View style={styles.center}>
          <HeaderHomeButton navigation={navigation as any} />
        </View>

        <View style={styles.right}>
          <HeaderActions
            navigation={navigation as any}
            routeName={route.name as keyof RootStackParamList}
          />
        </View>
      </View>

      {showSecondaryMenu ? (
        <View
          style={[
            styles.secondaryRow,
            {
              borderTopColor: paperTheme.colors.outline ?? "#00000022",
              backgroundColor: paperTheme.colors.background,
            },
          ]}
        >
          <CategoryNavMenu
            categories={props.mainCategories}
            onSelectCategory={(categoryId) =>
              (navigation as any).navigate("PLP", { q: categoryId })
            }
          />
        </View>
      ) : null}
    </View>
  );
}
