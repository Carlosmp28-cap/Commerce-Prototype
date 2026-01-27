import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 0,
    alignSelf: "stretch",
  },
  heroClip: {
    borderRadius: 0,
    overflow: "hidden",
  },
  heroImageBg: {
    minHeight: 240,
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
    paddingTop: 26,
    paddingBottom: 22,
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
});
