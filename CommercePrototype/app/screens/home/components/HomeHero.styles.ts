import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 16,
  },
  heroClip: {
    borderRadius: 16,
    overflow: "hidden",
  },
  heroImageBg: {
    minHeight: 190,
    justifyContent: "flex-end",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: 1.05 }],
  },
  heroImageBgImage: {
    transform: [{ scale: 1.05 }],
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  heroContent: {
    paddingTop: 18,
    paddingBottom: 16,
  },
  heroKicker: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 12,
  },
  heroHeadline: {
    marginTop: 6,
    color: "#fff",
    fontWeight: "900",
  },
  heroBody: {
    marginTop: 6,
    color: "rgba(255,255,255,0.9)",
    opacity: 0.95,
  },
  heroCtas: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },
  heroCtaButton: {
    // On narrow screens, avoid shrinking (which causes Paper's label to ellipsize).
    // With flexWrap enabled on the container, this will wrap buttons onto the next line instead.
    flexShrink: 0,
  },
});
