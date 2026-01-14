import React from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, Text } from "react-native-paper";

import type { RootStackParamList } from "../navigation";
import { ScreenScroll } from "../layout/Screen";
import { CenteredContent } from "../layout/CenteredContent";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  return (
    <ScreenScroll>
      <CenteredContent>
        <Card>
          <Card.Content style={{ gap: 12 }}>
            <Text variant="titleLarge" style={{ fontWeight: "900" }}>
              Sign in
            </Text>
            <Text style={{ opacity: 0.75 }}>
              Placeholder screen. The real login flow will be merged from
              another branch.
            </Text>

            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              accessibilityLabel="Back"
            >
              Back
            </Button>
          </Card.Content>
        </Card>
      </CenteredContent>
    </ScreenScroll>
  );
}
