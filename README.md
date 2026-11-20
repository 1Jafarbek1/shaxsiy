# Shaxsiy sayt: qoʻllanma

Bu oddiy sayt: oʻrnatish, `npm` yoki dasturlash kerak emas. Fayllarni hostingga joylaysiz, shu.

## Fayllar nima vazifa bajaradi

| Fayl yoki papka | Vazifasi | Oʻzgartirasizmi? |
|---|---|---|
| `index.html` | Saytning sahifa skeleti | Odatda yoʻq |
| `css/style.css` | Butun dizayn: ranglar, shriftlar, effektlar | Rang yoki shrift almashtirmoqchi boʻlsangiz |
| `js/common.js` | Umumiy kodlar, bo'lim turlari, Markdown | Yangi bo'lim qoʻshsangiz |
| `js/app.js` | Saytning ishlashi: sahifalar, qidiruv, effektlar | Yoʻq |
| `content/site.json` | Sayt nomi, ismingiz, shior, tarjimai hol, Telegram, email | Ha, yoki panel orqali |
| `content/posts.json` | Barcha maqola, sheʼr, xotira va kitob yozuvlari | Panel orqali |
| `images/` | Yozuvlardagi rasmlar | Panel oʻzi yuklaydi |
| `admin/index.html`, `admin/admin.js` | Yozish paneli (manzil: `sizning-sayt.uz/admin/`) | Yoʻq |
| `404.html` | Notoʻgʻri manzil sahifasi | Yoʻq |
| `.nojekyll` | GitHub Pages uchun texnik fayl | Yoʻq |

## Kompyuterda koʻrish
Fayllarni ikki marta bosib ochmang (maʼlumot yuklanmaydi). VS Code'da papkani ochib, pastdagi **Go Live** ni bosing.

## Internetga chiqarish (GitHub Pages, bepul)
1. github.com da repo yarating (nomi ixtiyoriy, **Public** boʻlsin). "Add file > Upload files" orqali shu papka *ichidagi* hamma narsani (papkalar bilan) yuklab, "Commit changes" bosing.
2. Repo > **Settings > Pages** > "Deploy from a branch" > branch `main`, papka `/ (root)` > Save. 1-2 daqiqadan keyin sayt `foydalanuvchi.github.io/repo-nomi/` da ochiladi.
3. **Domen ulash:** shu Pages sahifasida "Custom domain" ga domeningizni yozib Save bosing. **Keyin** domen sotib olgan joyingizdagi DNS sozlamasiga:
   - `A` yozuvlari (nomi `@`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` yozuvi (nomi `www`): `foydalanuvchi.github.io`
   DNS oʻzgarishi 24 soatgacha oʻtishi mumkin. Keyin Pages sahifasida **Enforce HTTPS** ni yoqing.

## Yozish paneli (post va rasm qoʻshish)
1. `sizning-sayt.uz/admin/` ni oching.
2. GitHub'da token yarating: github.com/settings/personal-access-tokens/new, "Repository access" da faqat shu repo, "Permissions" da **Contents: Read and write**.
3. Panelga repo (`foydalanuvchi/repo-nomi`), branch (`main`) va tokenni kiriting. Token faqat shu brauzerda saqlanadi.
4. "Yangi yozuv" bilan yozing, rasm qoʻshing, "Saqlash" bosing. Sayt 1-2 daqiqada yangilanadi.

## Matn yozish qoidalari
`## Sarlavha`, `**qalin**`, `*qiya*`, `[matn](https://havola)`, `- roʻyxat`, `> iqtibos`. Sheʼrda har satrni yangi qatordan, bandlarni boʻsh qator bilan ajrating.

## Cheklovlar
- Sahifa manzillari `sayt.uz/#p-nomi` shaklida. Qidiruv tizimlari (Google) va ijtimoiy tarmoq ulashuvlari (Telegram ko'rinishi) har bir yozuvni alohida sahifa sifatida koʻrmasligi mumkin.
- “Qoralama” yozuv saytda koʻrinmaydi, lekin `content/posts.json` fayli ochiq repoda hamma uchun oʻqiladi. Sir narsa yozmang.
- Token boshqalarga berilmasin. Yoʻqolsa, GitHub'da oʻchirib, yangisini yarating.
- Boshqa hosting (FTP) ishlatsangiz, yozish paneli ishlamaydi: `content/posts.json` ni qoʻlda tahrirlab, rasmlarni `images/` ga yuklaysiz.
