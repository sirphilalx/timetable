export interface PickedPhotoResult {
  ok: boolean;
  uri?: string;
  error?: string;
  cancelled?: boolean;
}

export interface StudentAvatarPreset {
  id: string;
  label: string;
  bg: string;
  ring: string;
  skin: string;
  hair: string;
  shirt: string;
  accent: string;
  hairStyle: "afro" | "fade" | "braids" | "curls" | "locs" | "headwrap";
  glasses?: boolean;
}

export const STUDENT_AVATAR_PRESETS: StudentAvatarPreset[] = [
  {
    id: "avatar:student-1",
    label: "Adaeze",
    bg: "#EEF2FF",
    ring: "#4F46E5",
    skin: "#8D5524",
    hair: "#1E1B4B",
    shirt: "#4F46E5",
    accent: "#C7D2FE",
    hairStyle: "braids",
  },
  {
    id: "avatar:student-2",
    label: "Chinedu",
    bg: "#ECFDF5",
    ring: "#059669",
    skin: "#6B3E26",
    hair: "#0F172A",
    shirt: "#059669",
    accent: "#A7F3D0",
    hairStyle: "fade",
    glasses: true,
  },
  {
    id: "avatar:student-3",
    label: "Zainab",
    bg: "#FFFBEB",
    ring: "#D97706",
    skin: "#A66E4E",
    hair: "#78350F",
    shirt: "#D97706",
    accent: "#FDE68A",
    hairStyle: "headwrap",
  },
  {
    id: "avatar:student-4",
    label: "Tunde",
    bg: "#EFF6FF",
    ring: "#2563EB",
    skin: "#5C3317",
    hair: "#0F172A",
    shirt: "#2563EB",
    accent: "#BFDBFE",
    hairStyle: "locs",
  },
  {
    id: "avatar:student-5",
    label: "Kemi",
    bg: "#FDF2F8",
    ring: "#DB2777",
    skin: "#7C4728",
    hair: "#1F2937",
    shirt: "#DB2777",
    accent: "#FBCFE8",
    hairStyle: "afro",
    glasses: true,
  },
  {
    id: "avatar:student-6",
    label: "Ibrahim",
    bg: "#F0FDFA",
    ring: "#0D9488",
    skin: "#8D5524",
    hair: "#111827",
    shirt: "#0D9488",
    accent: "#99F6E4",
    hairStyle: "curls",
  },
];

export async function pickPhotoFromLibrary(useCameraCapture = false): Promise<PickedPhotoResult> {
  if (typeof document === "undefined") {
    return { ok: false, cancelled: true };
  }

  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (useCameraCapture) {
      input.setAttribute("capture", "user");
    }

    let settled = false;
    const finish = (result: PickedPhotoResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        finish({ ok: false, cancelled: true });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          finish({ ok: true, uri: reader.result });
        } else {
          finish({ ok: false, error: "Could not read selected image." });
        }
      };
      reader.onerror = () => {
        finish({ ok: false, error: "Could not read selected image." });
      };
      reader.readAsDataURL(file);
    };

    input.oncancel = () => {
      finish({ ok: false, cancelled: true });
    };

    input.click();
  });
}
