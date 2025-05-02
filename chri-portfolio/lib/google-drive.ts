// lib/googleDrive.ts (Updated)
import { google, drive_v3 } from "googleapis";
import { GoogleAuth } from "google-auth-library";

const SERVICE_ACCOUNT_KEY_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

if (!SERVICE_ACCOUNT_KEY_JSON) {
  console.error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set.");
  // Handle this more gracefully in production, maybe throw error later or exit
}

const SCOPES: string[] = [
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
];

let credentials = null;
try {
  if (SERVICE_ACCOUNT_KEY_JSON) {
    credentials = JSON.parse(SERVICE_ACCOUNT_KEY_JSON);
    if (
      credentials &&
      typeof credentials === "object" &&
      credentials.type !== "service_account"
    ) {
      console.error(
        "GOOGLE_SERVICE_ACCOUNT_KEY does not appear to be service account JSON."
      );
      credentials = null;
    }
  }
} catch (e) {
  console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY JSON:", e);
  credentials = null;
}

const auth = new GoogleAuth({
  scopes: SCOPES,
  credentials: credentials || undefined, // Pass the parsed object or undefined
});

export const getDriveService = async (): Promise<drive_v3.Drive> => {
  if (!credentials) {
    // This check is still necessary to ensure credentials were loaded and parsed successfully
    throw new Error(
      "Google Service Account credentials are not loaded or invalid."
    );
  }
  try {
    // *** CHANGE IS HERE ***
    // Pass the 'auth' (GoogleAuth instance) directly to the drive constructor.
    // Googleapis will handle calling getClient() internally when it makes requests.
    const drive = google.drive({ version: "v3", auth: auth });
    return drive;
  } catch (error: any) {
    console.error(
      "Error getting Google Drive service with Service Account:",
      error
    );
    throw new Error("Failed to initialize Google Drive service.");
  }
};

// Re-export DriveFile type if needed
export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
};

export type DriveFileList = {
  files: DriveFile[];
};

export type DriveFileFull = DriveFile & {
  webViewLink: string;
  webContentLink: string;
  thumbnailLink: string;
  thumbnail: {
    image: string;
    mimeType: string;
  };
  md5Checksum: string;
  fileExtension: string;
  size: string;
  starred: boolean;
  trashed: boolean;
  explicitlyTrashed: boolean;
  appProperties: Record<string, string>;
};
