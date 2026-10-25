/// <reference types="vite/client" />

declare module '@image-import' {
  import type { ComponentType } from 'react';

  const ImageImport: ComponentType<{
    isOpen: boolean;
    onClose: () => void;
    onPlayersAdded: (players: string[]) => void;
  }>;
  export default ImageImport;
}
