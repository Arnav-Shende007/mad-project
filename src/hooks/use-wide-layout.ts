import { useSyncExternalStore } from 'react';
import { useWindowDimensions } from 'react-native';
import { Layout } from '@/constants/theme';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** Keep the first web render consistent with the static HTML, then adapt. */
export function useWideLayout() {
  const { width, fontScale } = useWindowDimensions();
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return hydrated && width >= Layout.wideBreakpoint && fontScale < 1.5;
}
