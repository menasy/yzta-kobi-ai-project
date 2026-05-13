import { ApiError } from "@repo/core";

export function getChatSendErrorReply(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return (
      "Mesaj gönderilirken beklenmeyen bir bağlantı sorunu yaşandı. " +
      "Lütfen kısa süre sonra tekrar deneyin."
    );
  }

  if (error.isUnauthorized) {
    return (
      "Oturumunuz sona ermiş görünüyor. Lütfen tekrar giriş yapıp aynı işlemi deneyin."
    );
  }

  if (error.isForbidden || error.key === "CHAT_FORBIDDEN") {
    return (
      "Bu sohbet oturumuna erişim yetkiniz yok. Kendi sohbet geçmişinizden bir oturum seçebilir veya yeni sohbet başlatabilirsiniz."
    );
  }

  if (error.isNotFound || error.key === "CHAT_NOT_FOUND") {
    return (
      "Bu sohbet oturumu bulunamadı. Silinmiş olabilir; yeni bir sohbet başlatıp devam edebilirsiniz."
    );
  }

  if (error.statusCode === 429 || error.key === "RATE_LIMIT_EXCEEDED") {
    return `${error.message} Birkaç saniye bekledikten sonra aynı sohbetten devam edebilirsiniz.`;
  }

  if (error.key === "DATABASE_NOT_READY") {
    return (
      "Veritabanı henüz hazır değil. Migration veya seed adımları tamamlandıktan sonra tekrar deneyin."
    );
  }

  if (error.key === "DATABASE_ERROR") {
    return (
      "Sohbet geçmişini kaydederken veritabanı tarafında bir sorun oluştu. Lütfen sayfayı yenileyip tekrar deneyin."
    );
  }

  if (error.key === "EXTERNAL_SERVICE_ERROR") {
    return (
      "AI sağlayıcısı şu anda yanıt veremiyor. Mesajınızı biraz sonra tekrar gönderebilirsiniz."
    );
  }

  if (error.isValidationError) {
    return error.message || "Mesaj içeriği geçersiz. Lütfen mesajınızı kontrol edin.";
  }

  return error.message || "Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.";
}
