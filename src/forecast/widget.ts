export type WidgetSnapshot = {
  city: string;
  temperature: string;
  detail: string;
  time: string;
};
export async function updateWidget(_snapshot: WidgetSnapshot) {
  /* No home widget on web. */
}
export function registerWidget() {
  /* No background task on web. */
}
