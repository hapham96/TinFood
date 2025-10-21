import { Camera, CameraResultType, CameraSource, PermissionStatus } from "@capacitor/camera";

/**
 * Service about Camera operations like taking photo or selecting from gallery
 */
export class CameraService {
  /**
   * check current camera & photo library permissions
   */
  async checkPermissions(): Promise<PermissionStatus> {
    try {
      const status = await Camera.checkPermissions();
      return status;
    } catch (err) {
      console.warn("⚠️ checkPermissions error:", err);
      return { camera: "denied", photos: "denied" } as PermissionStatus;
    }
  }

  /**
   * ask permission to access camera & photo library
   */
  async requestPermissions(): Promise<PermissionStatus> {
    try {
      const status = await Camera.requestPermissions({ permissions: ["camera", "photos"] });
      return status;
    } catch (err) {
      console.error("❌ requestPermissions error:", err);
      throw new Error("Permission request failed");
    }
  }

  /**
   * Function call or ask for camera & photo library permissions if not granted
   */
  async ensurePermissions(): Promise<boolean> {
    const status = await this.checkPermissions();

    const cameraGranted = status.camera === "granted" || status.camera === "limited";
    const photosGranted = status.photos === "granted" || status.photos === "limited";

    if (!cameraGranted || !photosGranted) {
      const newStatus = await this.requestPermissions();
      return (
        newStatus.camera === "granted" ||
        newStatus.camera === "limited" ||
        newStatus.photos === "granted" ||
        newStatus.photos === "limited"
      );
    }

    return true;
  }

  /**
   * Open Camera or Photo Library to take or select image
   * @returns base64Url string or null if canceled or error
   */
  async selectOrCaptureImage(): Promise<string | null> {
    try {
      const hasPermission = await this.ensurePermissions();
      if (!hasPermission) {
        alert("⚠️ Please grant camera and photo permissions to continue.");
        return null;
      }
      const photo = await Camera.getPhoto({
        quality: 80,
        width: 800,
        height: 1000,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // allow choose Camera or Gallery
      });

      if (!photo.dataUrl) return null;
      navigator.clipboard.writeText(photo.dataUrl); // TODO: test copy to clipboard
      return photo.dataUrl;
    } catch (err) {
      console.error("❌ selectOrCaptureImage error:", err);
      return null;
    }
  }
}

export const cameraService = new CameraService();
