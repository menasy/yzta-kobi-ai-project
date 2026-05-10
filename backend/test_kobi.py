from app.core.rabbitmq_client import RabbitMQClient

def stok_kontrol_simulasyonu(urun_adi, miktar):
    print(f"--- {urun_adi} kontrol ediliyor ---")
    if miktar < 50:
        haberci = RabbitMQClient()
        mesaj = f"KRİTİK UYARI: {urun_adi} stoğu {miktar} kg'a düştü! Hemen sipariş geçilmeli."
        haberci.mesaj_gonder(mesaj)
        haberci.kapat()
    else:
        print("Stok yeterli, sorun yok.")

# Test edelim: Domates 45 kg kalsın
stok_kontrol_simulasyonu("Domates", 45)