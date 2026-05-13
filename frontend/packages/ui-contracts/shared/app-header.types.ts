/**
 * @repo/ui-contracts/shared/app-header.types.ts
 */

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
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
   * Görünür birincil navigasyon öğeleri
   */
  navItems: NavItem[];

  /**
   * Logonun yönleneceği hedef
   */
  logoHref: string;
  
  /**
   * Çıkış yap butonuna tıklandığında çalışacak fonksiyon
   */
  onLogout: () => void;

  /**
   * Okunmamış bildirim sayısı (bell icon badge için)
   */
  unreadNotificationCount?: number;

  /**
   * Bildirim aksiyonunun görünür olup olmayacağı
   */
  showNotifications?: boolean;
  
  /**
   * Ekstra class'lar
   */
  className?: string;
}
