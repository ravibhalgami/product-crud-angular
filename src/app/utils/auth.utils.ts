import { isPlatformBrowser } from "@angular/common";
import { jwtDecode } from "jwt-decode";


export function getAuthToken(document: Document, platformId: Object): string | null {
  if (isPlatformBrowser(platformId) && document) {
    const name = 'token=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
  }
   
  return null; // Return null if no token is found
}

export function getUserRole(token: string): string | null {
  if (!token) {
      return null;
  }

  try {
      const decoded: any = jwtDecode(token);
      return decoded.role || null;
  } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
  }
}

