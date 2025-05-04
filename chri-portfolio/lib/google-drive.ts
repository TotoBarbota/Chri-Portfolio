// lib/google-drive.ts
// (Ensure this file is already set up for Service Account authentication)
import { google, drive_v3 } from "googleapis";
import { GoogleAuth } from "google-auth-library";

const SERVICE_ACCOUNT_KEY_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

if (!SERVICE_ACCOUNT_KEY_JSON) {
  console.error("GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set.");
  // In production, you might want to exit or throw an error here
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
  credentials: credentials || undefined,
});

export const getDriveService = async (): Promise<drive_v3.Drive> => {
  if (!credentials) {
    throw new Error(
      "Google Service Account credentials are not loaded or invalid."
    ) as Error;
  }
  try {
    const drive = google.drive({ version: "v3", auth: auth });
    return drive;
  } catch (error: unknown) {
    console.error(
      "Error getting Google Drive service with Service Account:",
      error
    );
    throw new Error("Failed to initialize Google Drive service.") as Error;
  }
};

// Define a type for the file object we expect from the API list call
// ADDED description and thumbnailLink
export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  description?: string; // Added description field
  thumbnailLink?: string; // Added thumbnailLink field (primarily for Projects)
};
