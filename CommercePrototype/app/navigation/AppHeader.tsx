import { useMemo } from "react";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { IconButton, useTheme as usePaperTheme } from "react-native-paper";

import type { RootStackParamList } from "../types";
import { HeaderActions, HeaderHomeButton } from "./HeaderParts";
import type { CategoryNodeDto } from "../models";
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
    <SafeAreaView
      edges={["top"]}
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
          <HeaderHomeButton navigation={navigation} />
        </View>

        <View style={styles.right}>
          <HeaderActions
            navigation={navigation}
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
              navigation.navigate("PLP", { q: categoryId })
            }
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}
