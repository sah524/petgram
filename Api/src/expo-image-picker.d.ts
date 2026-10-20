declare module "expo-image-picker" {
  export function requestCameraPermissionsAsync(): Promise<{ granted: boolean }>;
  export function launchCameraAsync(options: { mediaTypes: ['images']; quality: number; base64: boolean }): Promise<{ canceled: boolean; assets?: { uri: string; base64?: string | null }[] }>;
  export function launchImageLibraryAsync(options: { mediaTypes: ['images']; quality: number; base64: boolean }): Promise<{ canceled: boolean; assets?: { uri: string; base64?: string | null }[] }>;
}
