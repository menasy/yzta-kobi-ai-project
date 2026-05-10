import pika

class RabbitMQClient:
    def __init__(self):
        # Docker'da portu 5672 olarak açtık
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
        self.channel = self.connection.channel()
        # 'stok_uyari' adında bir kuyruk oluşturuyoruz
        self.channel.queue_declare(queue='stok_uyari')

    def mesaj_gonder(self, mesaj: str):
        self.channel.basic_publish(exchange='', routing_key='stok_uyari', body=mesaj)
        print(f" [x] Haberci: '{mesaj}' mesajı kuyruğa iletildi.")

    def kapat(self):
        self.connection.close()