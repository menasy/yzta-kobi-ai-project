/**
 * @repo/ui-contracts/shared/app-header.types.ts
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface AppHeaderUser {
  name: string;
  email?: string;
  avatarUrl?: string;
  initials?: string;
}

export interface AppHeaderProps {
  /**
   * Kullanıcının giriş yapıp yapmadığı durumu
   */
  isAuthenticated: boolean;
  
  /**
   * Giriş yapmış kullanıcı bilgileri
   */
  user?: AppHeaderUser;
  
  /**
   * Şu anki sayfa yolu (aktif menü elemanını belirlemek için)
   */
  activePathname?: string;
  
  /**
   * Çıkış yap butonuna tıklandığında çalışacak fonksiyon
   */
  onLogout: () => void;
  
  /**
   * Ekstra class'lar
   */
  className?: string;
}
