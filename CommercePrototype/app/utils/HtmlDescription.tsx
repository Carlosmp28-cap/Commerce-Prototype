import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../themes";

interface HtmlDescriptionProps {
  html?: string | null;
}

// Lightweight HTML renderer for simple content coming from SFCC:
// - handles <ul><li>...</li></ul>
// - handles simple <p>...</p> blocks
// - falls back to stripping tags for other content
export default function HtmlDescription({ html }: HtmlDescriptionProps) {
  const theme = useTheme();

  if (!html) return null;

  // Normalize and trim
  const source = String(html).trim();

  // Helper: remove common HTML entities
  const decodeEntities = (s: string) =>
    s
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();

  // Parse all <ul>...</ul> blocks and produce a mixed array of
  // either { type: 'list', items: string[] } or { type: 'text', text }
  const parts: Array<
    { type: "list"; items: string[] } | { type: "text"; text: string }
  > = [];

  // regex to find <ul> blocks (non-greedy)
  const ulRe = /<ul[^>]*>([\s\S]*?)<\/ul>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = ulRe.exec(source))) {
    const idx = match.index;
    const before = source.slice(lastIndex, idx).trim();
    if (before)
      parts.push({ type: "text", text: decodeEntities(stripTags(before)) });

    const inner = match[1];
    // find li items
    const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    const items: string[] = [];
    let liMatch: RegExpExecArray | null;
    while ((liMatch = liRe.exec(inner))) {
      items.push(decodeEntities(stripTags(liMatch[1])));
    }
    if (items.length > 0) parts.push({ type: "list", items });

    lastIndex = ulRe.lastIndex;
  }

  // trailing text after last UL
  if (lastIndex < source.length) {
    const tail = source.slice(lastIndex).trim();
    if (tail)
      parts.push({ type: "text", text: decodeEntities(stripTags(tail)) });
  }

  // If no ul blocks were found, treat the whole thing as either paragraphs or plain text
  if (parts.length === 0) {
    // split on <p> tags
    const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let found = false;
    let pm: RegExpExecArray | null;
    while ((pm = pRe.exec(source))) {
      found = true;
      const txt = decodeEntities(stripTags(pm[1]));
      if (txt) parts.push({ type: "text", text: txt });
    }
    if (!found) {
      parts.push({ type: "text", text: decodeEntities(stripTags(source)) });
    }
  }

  return (
    <View style={styles.container}>
      {parts.map((p, i) => {
        if (p.type === "text") {
          return (
            <Text
              key={i}
              style={[styles.text, { color: theme.colors.mutedText }]}
            >
              {p.text}
            </Text>
          );
        }
        return (
          <View key={i} style={styles.list}>
            {p.items.map((it, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text
                  style={[styles.bullet, { color: theme.colors.mutedText }]}
                >
                  •
                </Text>
                <Text style={[styles.text, { color: theme.colors.mutedText }]}>
                  {it}
                </Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

function stripTags(s: string) {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  list: {
    marginBottom: 8,
    paddingLeft: 6,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    width: 18,
    fontSize: 14,
  },
});
