import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, Text, TextInput } from "react-native-paper";

import type { RootStackParamList } from "../navigation";
import { ScreenScroll } from "../layout/Screen";
import { CenteredContent } from "../layout/CenteredContent";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { signIn } = useAuth();

  const [firstName, setFirstName] = useState("Demo");
  const [lastName, setLastName] = useState("User");
  const [email, setEmail] = useState("demo@commerce.local");
  const [password, setPassword] = useState("password");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      email.trim().length > 0 &&
      password.trim().length > 0 &&
      !submitting
    );
  }, [email, password, submitting]);

  const handleRegister = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await api.auth.register({
        email: email.trim(),
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });

      // Auto-login after successful registration so the user immediately gets:
      // - shopper session id for authenticated SFCC operations
      // - JWT for /api/customers/me endpoints
      // - basket merge (if there is a guest basket snapshot)
      await signIn({ email: email.trim(), password });

      navigation.goBack();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to register";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenScroll contentContainerStyle={styles.content}>
      <CenteredContent maxWidth={520} contentStyle={styles.centeredContent}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={{ fontWeight: "900" }}>
            Create account
          </Text>
          <Text style={{ opacity: 0.75 }}>
            Register with your email and password.
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <TextInput
              label="First name"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />

            <TextInput
              label="Last name"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />

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

            {error ? (
              <Text style={styles.error} accessibilityLabel="Register error">
                {error}
              </Text>
            ) : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={submitting}
              disabled={!canSubmit}
              accessibilityLabel="Create account"
            >
              Create account
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              accessibilityLabel="Back to login"
            >
              Back
            </Button>
          </Card.Content>
        </Card>
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
  error: {
    color: "#b00020",
  },
});
