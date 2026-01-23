import { StyleSheet, useWindowDimensions, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../navigation";
import { ScreenScroll } from "../layout/Screen";
import { CenteredContent } from "../layout/CenteredContent";

import { HomeHero } from "./home/components/HomeHero";
import { HomeFeaturedCarousel } from "./home/components/HomeFeaturedCarousel";
import { HomeValueProps } from "./home/components/HomeValueProps";

import { HOME_STRINGS } from "./home/homeStrings";
import { useHomeViewModel } from "./home/useHomeViewModel";

/** Home (landing) screen. */

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();

  const { homeMaxWidth, isWideWeb, heroImage, featuredProducts, openProduct } =
    useHomeViewModel(navigation, width);

  return (
    <ScreenScroll contentContainerStyle={styles.screenContent}>
      <View style={styles.heroFullBleed}>
        <HomeHero heroImage={heroImage} />
      </View>

      <CenteredContent maxWidth={homeMaxWidth} contentStyle={styles.content}>
        {isWideWeb ? (
          <>
            <HomeFeaturedCarousel
              title={HOME_STRINGS.featuredTitle}
              products={featuredProducts}
              onSeeAll={() => navigation.navigate("PLP")}
              onOpenProduct={openProduct}
            />

            <HomeValueProps title={HOME_STRINGS.valuePropsTitle} />
          </>
        ) : (
          <>
            <HomeFeaturedCarousel
              title={HOME_STRINGS.featuredTitle}
              products={featuredProducts}
              onSeeAll={() => navigation.navigate("PLP")}
              onOpenProduct={openProduct}
            />

            <HomeValueProps title={HOME_STRINGS.valuePropsTitle} />
          </>
        )}
      </CenteredContent>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  screenContent: {},
  heroFullBleed: {
    // `ScreenScroll` applies a consistent page padding. Negative margins let the hero
    // go edge-to-edge while keeping the rest of the page aligned.
    marginHorizontal: -16,
  },
  content: { gap: 14 },
  section: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeaderSpacer: {},
});
