export type PermissionState = 'unsupported' | NotificationPermission

export function permissionState(): PermissionState {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
}

export async function requestPermission(): Promise<PermissionState> {
  if (typeof Notification === 'undefined') return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}

/**
 * Shows a notification through the service worker when there is one (the only way that works on Android and
 * installed PWAs), and falls back to a plain page notification. Returns false when nothing could be shown.
 */
export async function showNotification(title: string, body: string): Promise<boolean> {
  if (permissionState() !== 'granted') return false
  const options: NotificationOptions = { body, icon: '/pwa-192x192.png', badge: '/pwa-192x192.png', tag: 'habitgrid-reminder' }
  try {
    const registration = await navigator.serviceWorker?.getRegistration()
    if (registration) {
      await registration.showNotification(title, options)
      return true
    }
    new Notification(title, options)
    return true
  } catch {
    return false
  }
}
