import { memo } from "react";
import type { ImageSourcePropType } from "react-native";
import { ImageBackground, Platform, View } from "react-native";
import {
  Button,
  Card,
  Text,
  useTheme as usePaperTheme,
} from "react-native-paper";

import { HomeImage } from "./HomeImage";
import { HOME_STRINGS } from "../homeStrings";
import { styles } from "./HomeHero.styles";

function HomeHeroComponent({
  heroImage,
  onShopAll,
  onShopSale,
}: {
  heroImage: ImageSourcePropType | undefined;
  onShopAll: () => void;
  onShopSale: () => void;
}) {
  const paperTheme = usePaperTheme();

  // On web, React Native Paper's `Card` renders as a native <button> when `onPress` is set.
  // Since we also render Paper `Button`s inside the hero, that would produce <button> inside <button>
  // (invalid HTML + hydration warnings). Keep the “tap the whole card” behavior on native, but not on web.
  const cardOnPress = Platform.OS === "web" ? undefined : onShopAll;

  const imageSource =
    heroImage ?? require("../../../../assets/images/react-logo.png");

  const heroContent = (
    <>
      <View style={styles.heroOverlay} />
      <Card.Content style={styles.heroContent}>
        <Text style={styles.heroKicker}>{HOME_STRINGS.heroKicker}</Text>
        <Text variant="headlineSmall" style={styles.heroHeadline}>
          {HOME_STRINGS.heroHeadline}
        </Text>
        <Text style={styles.heroBody}>{HOME_STRINGS.heroBody}</Text>

        <View style={styles.heroCtas}>
          <Button
            mode="contained"
            onPress={onShopAll}
            accessibilityLabel={HOME_STRINGS.shopAllA11y}
            style={styles.heroCtaButton}
          >
            {HOME_STRINGS.shopAllLabel}
          </Button>
          <Button
            mode="outlined"
            onPress={onShopSale}
            accessibilityLabel={HOME_STRINGS.shopSaleA11y}
            style={styles.heroCtaButton}
          >
            {HOME_STRINGS.shopSaleLabel}
          </Button>
        </View>
      </Card.Content>
    </>
  );

  return (
    <Card
      style={[styles.heroCard, { backgroundColor: paperTheme.colors.surface }]}
      onPress={cardOnPress}
      accessibilityRole={cardOnPress ? "button" : undefined}
      accessibilityLabel={
        cardOnPress ? HOME_STRINGS.heroOpenPlpA11y : undefined
      }
    >
      <View style={styles.heroClip}>
        {Platform.OS === "web" ? (
          <View style={styles.heroImageBg}>
            <HomeImage
              source={imageSource}
              alt={HOME_STRINGS.heroAlt}
              priority="high"
              style={styles.heroImage}
            />
            {heroContent}
          </View>
        ) : (
          <ImageBackground
            source={imageSource}
            style={styles.heroImageBg}
            imageStyle={styles.heroImageBgImage}
          >
            {heroContent}
          </ImageBackground>
        )}
      </View>
    </Card>
  );
}

export const HomeHero = memo(HomeHeroComponent);
