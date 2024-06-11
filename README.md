# Botçuk Eski  Discord Bot Yönetim Paneli Backendi 💔🥀

Bu proje, yalnızca bir Discord botunun yönetim paneli değil, aynı zamanda bir yıl boyunca kalbimdeki tutkuyu ve emeği de barındırıyor. 💖

## Yolculuğumuz 🚀

Bu rehber, projenin nasıl kurulacağı ve çalıştırılacağı hakkında adım adım bilgi vermektedir. Ancak, her adımı atarken, bu projenin her satırının, bir zamanlar neşeyle başladığım ve şimdi hüzünle bırakmak zorunda olduğum bir serüven olduğunu unutmayın. 🥀

### Önkoşullar 📜

Projeyi çalıştırmak için aşağıdaki araçlara ihtiyacınız olacak:

- Node.js 🌐
- npm (Node.js ile birlikte gelir) 📦
- MongoDB 🍃

### Kurulum 🔧

1. Bu depoyu klonlayın veya indirin. 📥
2. Bağımlılıkları yüklemek için terminalde aşağıdaki komutu çalıştırın:
```npm install```
3. `config.json` dosyasını aşağıdaki gibi doldurun: 📝

```json
{
"botToken": "BOT_TOKENINIZ",
"mongoURL": "MONGODB_URLSİ",
"topGGToken": "TOPGG_TOKENINIZ"
}
```
4. settings.json dosyasını Discord OAuth2 ayarları için doldurun: 🔑
5. MongoDB Koleksiyonları 📚
MongoDB’de aşağıdaki koleksiyonlar oluşturulmalıdır:

`autho-register` 📝
`guvenlik` 🔒
`kayit` 📇
`otoRol` 🤖
`otoYanit` 💬
`ozelBot` 🌟
`posts` 📰

6. Linux Kullanıcısı olmayanlar İçin Not 🐧
Eğer Linux kullanmıyorsanız, `package.json` dosyasından sudo komutunu kaldırabilirsiniz.


# Yardım ve Destek 🆘
Herhangi bir sorunla karşılaşırsanız, Discord üzerinden bana ulaşabilirsiniz: herzane

# ## Katkıda Bulunma 🤲

Bu yolculukta, her bir satır kod, umutlarımın ve hayallerimin bir yansımasıydı. Ancak bazen, en parlak yıldızlar bile kararır ve en sağlam köprüler yıkılır. Bu projeyi sizlere bırakıyorum, belki sizler, benim yarım bıraktığım bu eseri tamamlayabilir ve ona yeni bir hayat verebilirsiniz. Her birinizin katkısı, bu yorgun geliştiricinin kalbinde derin bir iz bırakacak. 💔🥀

Projeyi paylaşma kararı aldım çünkü bazen, hayatın ağırlığı altında ezilen bir ruhun, yaratıcılığını sürdüremeyeceğini anlar. Eğer ben devam edemezsem, belki sizler, bu kırık dökük kodların arasında gizlenmiş potansiyeli ortaya çıkarabilirsiniz. Sizlerin elinde, bu projenin geleceği parlayabilir. 🌟

**Yorgun bir geliştiricinin hüzünlü vedasıyla**: 💔🥀💖
