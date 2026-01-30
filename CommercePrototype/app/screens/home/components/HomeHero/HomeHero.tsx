import { memo, useRef, useState, useEffect } from "react";
import type { ImageSourcePropType } from "react-native";
import {
  ImageBackground,
  Platform,
  View,
  useWindowDimensions,
} from "react-native";
import { Card, Text, useTheme as usePaperTheme } from "react-native-paper";

import { HomeImage } from "../shared/HomeImage";
import { API_BASE_URL } from "../../../../services/api";
import { HOME_STRINGS } from "../../homeStrings";
import { styles } from "./HomeHero.styles";

/**
 * Home hero banner.
 *
 * Behavior summary:
 * - On web: always use the large SFCC banner URL (visual parity for desktop).
 * - On native: choose small/medium/large based on initial device width to
 *   approximate the CSS breakpoints and reduce bandwidth on small devices.
 * - Native image requests are routed through the backend image proxy
 *   (`/api/images/proxy?src=...`) to avoid platform-specific cross-origin
 *   and sandboxing issues. If the proxied image fails to load on native,
 *   the component falls back to the direct SFCC URL.
 */
function HomeHeroComponent({
  heroImage,
}: {
  heroImage: ImageSourcePropType | undefined;
}) {
  const paperTheme = usePaperTheme();
  const { width } = useWindowDimensions();

  // Choose remote SFCC image URL by device width (match provided CSS breakpoints)
  const selectRemoteHeroUrl = (_w: number) => {
    // Force the large SFCC hero image for all devices. This simplifies
    // testing and ensures consistent visuals across web and native.
    return "https://bcqk-007.dx.commercecloud.salesforce.com/on/demandware.static/-/Library-Sites-RefArchSharedLibrary/default/dw8af2cc93/images/homepage/homepage-4/large.jpg";
  };

  // Lock the initial image choice so a later backend prop doesn't override the
  // preferred SFCC banner. Choose the SFCC URL based on the initial width.
  const initialHeroRef = useRef<ImageSourcePropType | undefined>(heroImage);
  const initialRemoteRef = useRef<string | undefined>(
    selectRemoteHeroUrl(width),
  );

  const toBackendProxy = (remoteUrl?: string) => {
    if (!remoteUrl) return undefined;
    // On web: return the remote URL directly (avoids requiring the backend
    // proxy for desktop browser runs and prevents mixed-content problems).
    // On native: return the backend proxy URL so devices can reach SFCC via
    // the app origin and avoid platform-specific CORS/network issues.
    if (Platform.OS === "web") return remoteUrl;
    const base = API_BASE_URL.replace(/\/$/, "");
    return `${base}/api/images/proxy?src=${encodeURIComponent(remoteUrl)}`;
  };

  // Determine a stable chosen URI (string) to avoid creating a new object
  // every render which would trigger state updates repeatedly.
  let fallbackRemoteUri: string | undefined;
  let localAsset: ImageSourcePropType | undefined;
  let chosenUri: string | undefined;

  if (
    initialHeroRef.current &&
    typeof initialHeroRef.current === "object" &&
    "uri" in initialHeroRef.current
  ) {
    const uri = (initialHeroRef.current as any).uri as string | undefined;
    if (uri) {
      const m = uri.match(/[?&]src=([^&]+)/);
      // Keep a copy of the original remote URL; used as a fallback if
      // proxy-served image fails on native platforms.
      fallbackRemoteUri = m ? decodeURIComponent(m[1]) : uri;
      // Build a proxied URL for native, but fall back to the original
      // remote URL if the proxy helper doesn't return a value.
      const proxy = toBackendProxy(uri);
      const finalUri = proxy ?? uri;
      chosenUri = finalUri as string | undefined;
    } else {
      localAsset = initialHeroRef.current;
    }
  } else if (initialHeroRef.current) {
    // local require() asset or other non-uri source
    localAsset = initialHeroRef.current;
  } else {
    // When no explicit `heroImage` is provided by the backend, use the
    // selected remote URL (chosen by `selectRemoteHeroUrl`). On web this
    // will resolve to the large image variant.
    fallbackRemoteUri = initialRemoteRef.current;
    const proxy = toBackendProxy(initialRemoteRef.current);
    const finalUri = proxy ?? initialRemoteRef.current;
    chosenUri = finalUri as string | undefined;
  }

  // Manage displayed source so we can fallback to the SFCC-hosted image if
  // the proxy-served image fails to load on native devices. Use the stable
  // `chosenUri` string as the effect dependency to avoid infinite loops.
  const [displayedSource, setDisplayedSource] = useState<
    ImageSourcePropType | undefined
  >(localAsset ?? (chosenUri ? { uri: chosenUri } : undefined));

  useEffect(() => {
    setDisplayedSource(
      localAsset ?? (chosenUri ? { uri: chosenUri } : undefined),
    );
    // Only depend on chosenUri and localAsset (localAsset is stable via ref)
  }, [chosenUri, localAsset]);

  const handleImageError = () => {
    const cur = (displayedSource as any)?.uri as string | undefined;
    if (!cur) return;
    if (fallbackRemoteUri && cur.includes("/api/images/proxy")) {
      setDisplayedSource({ uri: fallbackRemoteUri });
    }
  };

  // Responsive sizes
  let minHeight = 240;
  let contentPaddingTop = 26;
  if (Platform.OS === "web") {
    if (width >= 1600) minHeight = 560;
    else if (width >= 1280) minHeight = 480;
    else if (width >= 1024) minHeight = 440;
    else if (width >= 768) minHeight = 380;
    else minHeight = 320;
    contentPaddingTop = width >= 1024 ? 36 : 28;
  } else {
    minHeight = width >= 768 ? 320 : 220;
    contentPaddingTop = width >= 768 ? 30 : 22;
  }

  const heroTextContent = (
    <>
      <View style={styles.heroOverlay} />
      <Text style={styles.heroKicker}>{HOME_STRINGS.heroKicker}</Text>
      <Text variant="headlineSmall" style={styles.heroHeadline}>
        {HOME_STRINGS.heroHeadline}
      </Text>
      <Text style={styles.heroBody}>{HOME_STRINGS.heroBody}</Text>
    </>
  );

  const imageBgStyle = [styles.heroImageBg, { minHeight }];
  const contentStyle = [styles.heroContent, { paddingTop: contentPaddingTop }];

  return (
    <Card
      style={[styles.heroCard, { backgroundColor: paperTheme.colors.surface }]}
    >
      <View style={styles.heroClip}>
        {Platform.OS === "web" ? (
          <View style={imageBgStyle}>
            {displayedSource ? (
              <HomeImage
                source={displayedSource}
                alt={HOME_STRINGS.heroAlt}
                priority="high"
                style={styles.heroImage}
                onError={handleImageError}
              />
            ) : null}
            <Card.Content style={contentStyle}>{heroTextContent}</Card.Content>
          </View>
        ) : displayedSource ? (
          <ImageBackground
            source={displayedSource}
            style={imageBgStyle}
            imageStyle={styles.heroImageBgImage}
            onError={handleImageError}
          >
            <Card.Content style={contentStyle}>{heroTextContent}</Card.Content>
          </ImageBackground>
        ) : (
          <View style={imageBgStyle}>
            <Card.Content style={contentStyle}>{heroTextContent}</Card.Content>
          </View>
        )}
      </View>
    </Card>
  );
}

export const HomeHero = memo(HomeHeroComponent);
