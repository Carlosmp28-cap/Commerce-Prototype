import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, Text, TextInput } from "react-native-paper";

import type { RootStackParamList } from "../navigation";
import { ScreenScroll } from "../layout/Screen";
import { CenteredContent } from "../layout/CenteredContent";
import { useAuth } from "../hooks/useAuth";

// Login screen (UI-first).
// For now, sign-in is mocked via `useAuth()`; later swap to a real auth service.

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { user, signIn, signOut, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("demo@commerce.local");
  const [password, setPassword] = useState("password");
  const [submitting, setSubmitting] = useState(false);

  const subtitle = useMemo(() => {
    if (isAuthenticated) return `Signed in as ${user?.email ?? "user"}`;
    return "Use your credentials to sign in.";
  }, [isAuthenticated, user]);

  const handleSignIn = async () => {
    setSubmitting(true);
    try {
      await signIn({ email, password });
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinueAsGuest = () => {
    navigation.goBack();
  };

  return (
    <ScreenScroll contentContainerStyle={styles.content}>
      <CenteredContent maxWidth={520} contentStyle={styles.centeredContent}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={{ fontWeight: "900" }}>
            Login
          </Text>
          <Text style={{ opacity: 0.75 }}>{subtitle}</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <TextInput
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {!isAuthenticated ? (
              <Button
                mode="contained"
                onPress={handleSignIn}
                loading={submitting}
                disabled={submitting}
                accessibilityLabel="Sign in"
              >
                Sign in
              </Button>
            ) : (
              <Button
                mode="outlined"
                onPress={() => {
                  signOut();
                }}
                accessibilityLabel="Sign out"
              >
                Sign out
              </Button>
            )}

            <Button
              mode="text"
              onPress={handleContinueAsGuest}
              accessibilityLabel="Continue as guest"
            >
              Continue as guest
            </Button>

            {!isAuthenticated ? (
              <Button
                mode="text"
                onPress={() => navigation.navigate("Register")}
                accessibilityLabel="Create account"
              >
                Create account
              </Button>
            ) : null}
          </Card.Content>
        </Card>

        <Text style={styles.note}>
          Note: this is a prototype UI. Authentication is mocked for now.
        </Text>
      </CenteredContent>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  centeredContent: {
    gap: 12,
  },
  header: {
    gap: 6,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
  },
  cardContent: {
    gap: 12,
    paddingTop: 14,
  },
  note: {
    opacity: 0.6,
    fontSize: 12,
  },
});
