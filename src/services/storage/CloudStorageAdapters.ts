import { StorageProviderType } from '../../types';

export interface CloudProviderConfig {
  type: StorageProviderType;
  name: string;
  shortDesc: string;
  scope: string;
  appFolder: string;
  isAvailable: boolean;
  statusText: string;
  documentationUrl: string;
}

export const CLOUD_PROVIDERS: Record<string, CloudProviderConfig> = {
  googledrive: {
    type: 'googledrive',
    name: 'Google Drive',
    shortDesc: 'Syncs exclusively to your private "The Journey/" folder.',
    scope: 'https://www.googleapis.com/auth/drive.file (App folder only)',
    appFolder: 'The Journey/',
    isAvailable: true,
    statusText: 'Bring your own Google account credentials.',
    documentationUrl: 'https://developers.google.com/drive/api/guides/about-sdk'
  },
  onedrive: {
    type: 'onedrive',
    name: 'Microsoft OneDrive',
    shortDesc: 'Saves your backup directly in OneDrive App Root.',
    scope: 'Files.ReadWrite.AppFolder (Restricted to App folder)',
    appFolder: 'Apps/The Journey/',
    isAvailable: true,
    statusText: 'Bring your own Microsoft account credentials.',
    documentationUrl: 'https://learn.microsoft.com/en-us/graph/api/resources/onedrive'
  },
  dropbox: {
    type: 'dropbox',
    name: 'Dropbox',
    shortDesc: 'Zero server storage. Directly writes to your Dropbox App folder.',
    scope: 'files.content.write, files.content.read (App sandbox)',
    appFolder: '/Apps/The Journey/',
    isAvailable: true,
    statusText: 'Bring your own Dropbox developer token.',
    documentationUrl: 'https://www.dropbox.com/developers/documentation'
  }
};
