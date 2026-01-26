import { memo } from "react";
import type { ImageSourcePropType } from "react-native";
import { ImageBackground, Platform, View } from "react-native";
import { Card, Text, useTheme as usePaperTheme } from "react-native-paper";

import { HomeImage } from "../shared/HomeImage";
import { HOME_STRINGS } from "../../homeStrings";
import { styles } from "./HomeHero.styles";

/**
 * Home hero banner.
 *
 * Uses `HomeImage` on web for better control over `<img>` attributes (alt, fetchPriority).
 */
function HomeHeroComponent({
  heroImage,
}: {
  heroImage: ImageSourcePropType | undefined;
}) {
  const paperTheme = usePaperTheme();

  const imageSource =
    heroImage ?? require("../../../../../assets/images/react-logo.png");

  const heroContent = (
    <>
      <View style={styles.heroOverlay} />
      <Card.Content style={styles.heroContent}>
        <Text style={styles.heroKicker}>{HOME_STRINGS.heroKicker}</Text>
        <Text variant="headlineSmall" style={styles.heroHeadline}>
          {HOME_STRINGS.heroHeadline}
        </Text>
        <Text style={styles.heroBody}>{HOME_STRINGS.heroBody}</Text>
      </Card.Content>
    </>
  );

  return (
    <Card
      style={[styles.heroCard, { backgroundColor: paperTheme.colors.surface }]}
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
