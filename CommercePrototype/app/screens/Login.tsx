
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { ScreenScroll } from "../layout/Screen";
import { CenteredContent } from "../layout/CenteredContent";
import { useAuth } from "../hooks/useAuth";
import { api } from "../services/api";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { user, signIn, signOut, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("demo@commerce.local");
  const [password, setPassword] = useState("password");
  const [submitting, setSubmitting] = useState(false);
  // Mensagens agora são exibidas via alert()

  const subtitle = useMemo(() =>
    isAuthenticated ? `Signed in as ${user?.email ?? "user"}` : "Use your credentials to sign in.",
    [isAuthenticated, user]
  );


  const handleSignIn = async () => {
    setSubmitting(true);
    // ...existing code...
    try {
      await signIn({ email, password });
      alert("Login successful! Redirecting...");
      navigation.replace("Home");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to login";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinueAsGuest = async () => {
    if (isAuthenticated) {
      await signOut();
    }
    try {
      await api.auth.guest();
    } catch (e) {
      // Se falhar, apenas ignora
    }
    navigation.replace("Home");
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
              <>
                <Button
                  mode="contained"
                  onPress={handleSignIn}
                  loading={submitting}
                  disabled={submitting}
                  accessibilityLabel="Sign in"
                >
                  Sign in
                </Button>
                {/* Mensagens agora são exibidas via alert() */}
              </>
            ) : (
              <Button
                mode="outlined"
                onPress={async () => {
                  await signOut();
                  try {
                    await api.auth.guest();
                  } catch (e) {}
                  navigation.replace("Home");
                }}
                accessibilityLabel="Sign out"
              >
                Sign out
              </Button>
            )}



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

        <Text style={styles.note}>Note: this is a prototype UI.</Text>
      </CenteredContent>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
  centeredContent: { gap: 12 },
  header: { gap: 6 },
  card: { width: "100%", backgroundColor: "#fff", borderRadius: 14 },
  cardContent: { gap: 12, paddingTop: 14 },
  note: { opacity: 0.6, fontSize: 12 },
});
