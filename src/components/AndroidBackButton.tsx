import React, { useEffect } from 'react';
import { App } from '@capacitor/app';

import { isNativeApp } from '../platform/native';

/** Maps the Android hardware back button onto browser history; exits only at the root screen. */
export const AndroidBackButton: React.FC = () => {
  useEffect(() => {
    if (!isNativeApp()) return;

    const listener = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else App.exitApp();
    });

    return () => {
      void listener.then(handle => handle.remove());
    };
  }, []);

  return null;
};
