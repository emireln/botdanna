// Opens a link from the app. A path that starts with / opens a page of the app. An https address opens in the
// browser. Any other address is not opened.
import { bridge } from './bridge';

export function openLink(url: string, navigate: (to: string) => void): void {
  if (url.startsWith('/')) {
    navigate(url);
    return;
  }
  if (!/^https:\/\//i.test(url)) return;
  if (bridge) void bridge.openExternal(url);
  else window.open(url, '_blank', 'noopener,noreferrer');
}
