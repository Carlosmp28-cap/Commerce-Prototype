import React from "react";
import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import {
  IconButton,
  Portal,
  Dialog,
  TextInput,
  Button,
  Text,
} from "react-native-paper";

export function HeaderHomeButton({ navigation }: { navigation: any }) {
  const paperTheme = {} as any; // placeholder for theme usage in index
  // We will rely on the caller to style via the shared styles in index.tsx
  const { width } = useWindowDimensions();
  const isNative = Platform.OS !== "web";
  const useTwoLineTitle = isNative && width < 500;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go to Home"
      onPress={() => {
        const nav = navigation as any;
        if (typeof nav.reset === "function") {
          try {
            nav.reset({ index: 0, routes: [{ name: "Home" }] });
            return;
          } catch {}
        }
        if (typeof nav.popToTop === "function") {
          try {
            nav.popToTop();
            return;
          } catch {}
        }
        try {
          nav.navigate("Home");
        } catch {
          // ignore
        }
      }}
      hitSlop={10}
      style={{
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 10,
        flexShrink: 1,
      }}
    >
      {useTwoLineTitle ? (
        <View style={{ alignItems: "center" }}>
          <Text
            numberOfLines={1}
            style={{ fontWeight: "700", textAlign: "center" }}
          >
            Commerce
          </Text>
          <Text
            numberOfLines={1}
            style={{ fontWeight: "700", textAlign: "center" }}
          >
            Prototype
          </Text>
        </View>
      ) : (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ fontWeight: "700", textAlign: "center" }}
        >
          Commerce Prototype
        </Text>
      )}
    </Pressable>
  );
}

export function HeaderActions({
  navigation,
  routeName,
}: {
  navigation: any;
  routeName: string;
}) {
  const { width } = useWindowDimensions();
  const isNative = Platform.OS !== "web";
  const isCompact = isNative && width < 390;
  const iconSize = isNative ? (isCompact ? 20 : 22) : 24;

  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchMissingOpen, setIsSearchMissingOpen] = React.useState(false);

  const closeSearch = React.useCallback(() => setIsSearchOpen(false), []);
  const openSearch = React.useCallback(() => setIsSearchOpen(true), []);

  const submitSearch = React.useCallback(() => {
    closeSearch();
    if (searchQuery.trim().length > 0) {
      setIsSearchMissingOpen(true);
    }
  }, [closeSearch, searchQuery]);

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <IconButton
        icon="magnify"
        size={iconSize}
        onPress={openSearch}
        accessibilityLabel="Search"
      />

      <Portal>
        <Dialog visible={isSearchOpen} onDismiss={closeSearch}>
          <Dialog.Title>Search products</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search products"
              autoFocus
              returnKeyType="search"
              onSubmitEditing={submitSearch}
              accessibilityLabel="Search products"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeSearch}>Cancel</Button>
            <Button onPress={submitSearch}>Search</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={isSearchMissingOpen}
          onDismiss={() => setIsSearchMissingOpen(false)}
        >
          <Dialog.Title>Search not implemented</Dialog.Title>
          <Dialog.Content>
            <Text>
              Missing implementation: search suggestions should use GET
              /search_suggestion.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsSearchMissingOpen(false)}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <IconButton
        icon="account"
        size={iconSize}
        onPress={() => navigation.navigate("Login")}
        accessibilityLabel="Account"
      />

      {routeName === "Cart" ? null : (
        <IconButton
          icon="cart"
          size={iconSize}
          onPress={() => navigation.navigate("Cart")}
          accessibilityLabel="Cart"
        />
      )}
    </View>
  );
}
