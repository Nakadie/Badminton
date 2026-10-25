import { Capacitor } from '@capacitor/core';

/** True inside the Capacitor shell, false on the hosted web app. */
export const isNativeApp = (): boolean => Capacitor.isNativePlatform();

/** Build-time switch: the native bundle leaves the photo pipeline out entirely. */
export const isNativeBuild = import.meta.env.VITE_NATIVE === '1';
