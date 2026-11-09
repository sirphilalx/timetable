import {
  STUDENT_AVATAR_PRESETS,
  type PickedPhotoResult,
  type StudentAvatarPreset,
} from "./photoPicker.web";

export { STUDENT_AVATAR_PRESETS, type PickedPhotoResult, type StudentAvatarPreset };

export async function pickPhotoFromLibrary(useCameraCapture = false): Promise<PickedPhotoResult> {
  try {
    // Dynamically resolve expo-image-picker if bundled in the current runtime
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ImagePicker = require("expo-image-picker");
    if (ImagePicker) {
      if (useCameraCapture && typeof ImagePicker.launchCameraAsync === "function") {
        const perm = await ImagePicker.requestCameraPermissionsAsync?.();
        if (perm && !perm.granted) {
          return { ok: false, error: "Camera permission is required to take a photo." };
        }
        const res = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.75,
        });
        if (res?.canceled) {
          return { ok: false, cancelled: true };
        }
        const assetUri = res?.assets?.[0]?.uri;
        if (assetUri) {
          return { ok: true, uri: assetUri };
        }
      } else if (typeof ImagePicker.launchImageLibraryAsync === "function") {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync?.();
        if (perm && !perm.granted) {
          return { ok: false, error: "Photo library access is required to choose a photo." };
        }
        const res = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.75,
        });
        if (res?.canceled) {
          return { ok: false, cancelled: true };
        }
        const assetUri = res?.assets?.[0]?.uri;
        if (assetUri) {
          return { ok: true, uri: assetUri };
        }
      }
    }
  } catch {
    // Fallback to in-app camera / portrait studio sheet when native image picker module is not bundled
  }

  return {
    ok: false,
    error: "native_picker_unavailable",
  };
}
