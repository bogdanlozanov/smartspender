import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

import { ReceiptsProvider } from '@/src/state/ReceiptProvider';
import { colors } from '@/src/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <ReceiptsProvider>
          <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.surface },
              headerTintColor: colors.text,
              contentStyle: { backgroundColor: colors.background },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="processing" options={{ title: 'Processing' }} />
            <Stack.Screen name="review/[id]" options={{ title: 'Review Receipt' }} />
            <Stack.Screen name="history/index" options={{ title: 'History' }} />
            <Stack.Screen name="history/[id]" options={{ title: 'Receipt Detail' }} />
          </Stack>
        </ReceiptsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
