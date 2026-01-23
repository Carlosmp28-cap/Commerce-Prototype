import { Platform } from "react-native";
import * as Device from "expo-device";
import { useState, useEffect } from "react";

export function useIsTablet() {
  const [isTablet, setIsTablet] = useState(
    Platform.OS === "web" ? false : null,
  );

  useEffect(() => {
    (async () => {
      if (Platform.OS === "web") {
        setIsTablet(false);
        return;
      }
      const type = await Device.getDeviceTypeAsync();
      setIsTablet(type === Device.DeviceType.TABLET);
    })();
  }, []);

  return isTablet; // can be true, false, or null (loading)
}
