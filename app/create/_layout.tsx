import { Stack } from 'expo-router';

export default function CreateLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="race" />
      <Stack.Screen name="class" />
      <Stack.Screen name="background" />
      <Stack.Screen name="abilities" />
      <Stack.Screen name="equipment" />
      <Stack.Screen name="skills" />
      <Stack.Screen name="spells" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}