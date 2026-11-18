# بيئة العمل ومصفوفة الإصدارات

آخر تحقق للمصادر: **2026-11-18**. هذه المصفوفة تميز بين الإصدار المعتمد، والمتطلب الذي تحقق، وبين البرنامج المثبت فعليًا وحالة تشغيله.

| الأداة | الإصدار/الاختيار | حالة التوافق | حالة الجهاز/المشروع |
|---|---|---|---|
| نظام التطوير | Windows + WSL2 + Ubuntu | معتمد | WSL2 وتوزيعة Ubuntu موجودان |
| Docker Desktop | إصدار مثبت لدى المستخدم | معتمد كبيئة | التطبيق يبدأ كعملية، لكنه يعرض `Docker Desktop is unable to start`؛ Linux Engine غير متاح |
| PHP | 8.3 داخل حاوية | Bagisto 2.4.10 يتطلب `>=8.3 <8.5` | لم تُسحب/تُشغل حاوية PHP بعد |
| Composer | 2 داخل حاوية | مطلوب من API 2.4.4 | لم يُشغل بعد |
| Bagisto | 2.4.10 | موجود؛ Laravel `^12.0` وPHP `>=8.3 <8.5` | لم يُثبت |
| Bagisto API | 2.4.4 | يختبر Bagisto 2.4.10 | لم يُثبت |
| Laravel | 12.x | يأتي مع Bagisto 2.4.10 | غير موجود كتطبيق حتى الآن |
| قاعدة البيانات | MySQL 8.0 | API يذكر MySQL 8.0+ | لم تُشغل؛ تأكيد دعم Oracle بتاريخ التثبيت ما زال بوابة مطلوبة |
| Node.js | 22 LTS داخل Ubuntu عبر nvm | الاتجاه معتمد | `22.23.5`؛ تم التحقق من shell جديد |
| npm | المرفق مع Node 22 | يعتمد على Node 22 | `10.9.9`؛ تم التحقق من shell جديد |
| Git/GitHub | Git على Windows، مستودع `main` | متاح | مربوط بـ `origin/main` |

## نتائج التوافق الموثقة

- [Bagisto 2.4.10 composer.json](https://github.com/bagisto/bagisto/blob/v2.4.10/composer.json): PHP `>=8.3 <8.5`، وLaravel `^12.0`، وامتدادات PHP اللازمة موضحة في manifest.
- [Bagisto API 2.4.4 README](https://github.com/bagisto/bagisto-api/blob/v2.4.4/README.md): PHP 8.3+، Composer 2، Bagisto 2.4.x مختبر على 2.4.10، MySQL 8.0+ أو PostgreSQL 14+.
- [Bagisto Docker tag](https://hub.docker.com/r/webkul/bagisto/tags): تحقق وجود `webkul/bagisto:2.4.10` مع amd64 وarm64؛ لم تُسحب الصورة أو تُشغل.
- [Bagisto Next.js Commerce README](https://github.com/bagisto/nextjs-commerce): يذكر Bagisto 2.4.x وAPI 1.0.3، لذلك لا نفترض توافقه مع API Platform 2.4.4 دون مراجعة.
- [Oracle Lifetime Support Policy](https://www.oracle.com/support/lifetime-support/): مرجع دورة الدعم؛ يلزم تسجيل حالة MySQL 8.0 ومستوى الدعم المتاح وتاريخه من وثيقة Oracle المناسبة قبل اعتماد تشغيل قاعدة البيانات.

تفاصيل القرار وبوابات التثبيت في [ADR-023](../decisions/ADR-023-backend-stack.md).

## أوامر فحص البيئة

من Ubuntu:

```bash
node --version
npm --version
```

يجب أن يعرض Node إصدار `v22.x` وأن يكون مسار `node` ضمن `~/.nvm/versions/node/`. تجنب Node 25 الخاص ببيئة Windows عند العمل على الواجهة داخل Ubuntu.

من PowerShell للتحقق من Docker:

```powershell
docker info
docker compose version
```

إذا فشل `docker info` بسبب عدم توفر `dockerDesktopLinuxEngine`، افتح Docker Desktop وانتظر اكتمال تشغيل Linux Engine ثم أعد الفحص. لا تبدأ تثبيت Bagisto قبل نجاح هذا الفحص.

في آخر فحص كان إصدار WSL kernel هو `5.10.16`، وتحديثات Windows متوقفة مؤقتًا. إذا استمر خطأ Docker Desktop، نفّذ يدويًا من PowerShell كمسؤول:

```powershell
wsl --update
wsl --shutdown
```

بعدها افتح Docker Desktop مجددًا وتحقق من `docker info`. لا تستخدم `wsl --unregister` أو تحذف توزيعة Ubuntu؛ ذلك قد يحذف بياناتها.

## قواعد تثبيت Backend

- ينشأ المشروع في `backend/bagisto` انطلاقًا من جذر المستودع، لا من داخل `backend/` مع تكرار مسار الوجهة.
- يشغّل PHP وComposer داخل حاويات مثبتة الإصدارات، وليس على Ubuntu المضيف.
- لا تستخدم وسم `latest`.
- لا تحفظ كلمة مرور MySQL أو مفاتيح Laravel أو بيانات حقيقية في المستودع. استخدم ملفًا محليًا مستثنى من Git ومتغيرات بيئة.
- أوامر تثبيت Bagisto وAPI مؤجلة حتى يصبح Docker Engine جاهزًا ويكتمل تحقق دعم MySQL. انظر [ADR-023](../decisions/ADR-023-backend-stack.md).

لم تُثبت اعتمادات Backend أو Frontend، ولم تُنشأ بعد ملفات تشغيل Docker في هذه المرحلة.

### سجل تنفيذ B1 — 2026-11-18

مصدر أمر إنشاء المشروع: [دليل Bagisto الرسمي للتثبيت](https://devdocs.bagisto.com/getting-started/installation.html) يوصي بـ `composer create-project bagisto/bagisto <directory>`، ويذكر إضافة قيد إصدار عند تثبيت إصدار محدد. صفحة إصدار Bagisto 2.4.10 تربط بدليل التثبيت: [README عند الوسم v2.4.10](https://github.com/bagisto/bagisto/blob/v2.4.10/README.md).

الأمر المخطط بعد اختيار صورة PHP المطابقة، ولم يُنفذ بعد:

```bash
composer create-project bagisto/bagisto backend/bagisto "2.4.10"
```

الأوامر المنفذة ومخرجاتها:

```text
docker info --format '{{.ServerVersion}}'
29.9.3

backend/bagisto exists: False

docker pull composer:2.8.12
Status: Downloaded newer image for composer:2.8.12
docker.io/library/composer:2.8.12
Digest: sha256:5248900ab8b5f7f880c2d62180e40960cd87f60149ec9a1abfd62ac72a02577c

docker run --rm composer:2.8.12 php -v
PHP 8.4.14 (cli) (built: Oct 24 2025 19:24:42) (NTS)

docker run --rm composer:2.8.12 composer --version
Composer version 2.8.12 2025-09-19 13:41:59
PHP version 8.4.14 (/usr/local/bin/php)
```

**النتيجة:** `BLOCKED` — الصورة المسحوبة لا تطابق PHP 8.3 المثبت في ADR-023. لم يُنفذ `composer create-project` أو تثبيت API أو أوامر Artisan، ولم يُنشأ `backend/bagisto`. يلزم اعتماد صورة PHP 8.3/Composer 2 مثبتة، أو قرار مالك بتعديل ADR-023 قبل المتابعة. لم يبدأ أي container لقاعدة بيانات.

### مرشح صورة بديل — تحقق registry ومصدر البناء، 2026-11-18

- يعرض Docker Hub الوسم `composer:2.8.2` كوسم نشط، وآخر نشر مسجل له 2024-11-14: [بيانات الوسم](https://hub.docker.com/v2/repositories/library/composer/tags/2.8.2).
- سجل الصورة الرسمي يربط الوسم بمصدر بناء محدد: [تغيير إصدار Composer 2.8.2](https://github.com/docker-library/official-images/commit/f8057ea472fe1863623a3ad12a906811e4f2186c) و[Dockerfile عند commit البناء](https://github.com/composer/docker/blob/327b1e8184e42fdb25262da9617a8c236eeed82c/latest/Dockerfile)، الذي يبدأ من `php:8-alpine` ويثبت Composer `2.8.2`.
- تاريخ النشر أسبق من تحديث إصدار PHP 8.4.0 في مستودع PHP بتاريخ 2024-11-19: [PHP 8.4.0 source commit](https://github.com/php/php-src/commit/b437f2b32eb364c9496d24abcc734272e5c9c980). لذلك `composer:2.8.2` مرشح محتمل لـ PHP 8.3، وليس إثباتًا لنسخة PHP الفعلية.
- لم يُسحب هذا الوسم ولم يُفحص تشغيله؛ يلزم إذن المالك قبل السحب، ثم يجب التحقق من `php -v` و`composer --version` قبل أي إنشاء.

### نتيجة فحص المرشح بعد موافقة المالك — 2026-11-18

وافق المالك على سحب `composer:2.8.2` للفحص فقط. مخرجات الأوامر:

```text
docker pull composer:2.8.2
Status: Downloaded newer image for composer:2.8.2
docker.io/library/composer:2.8.2
Digest: sha256:12cd736fa74a5ed126b1fe11dc3695380e445b46a4ec7de53203c275d792ead0

docker run --rm composer:2.8.2 php -v
PHP 8.3.13 (cli) (built: Nov 12 2024 02:08:18) (NTS)

docker run --rm composer:2.8.2 composer --version
Composer version 2.8.2 2024-10-29 16:12:11
PHP version 8.3.13 (/usr/local/bin/php)
```

`docker run --rm composer:2.8.2 php -m` أظهر أن الإضافات التالية من متطلبات Bagisto غير متوفرة في الصورة: `calendar`, `intl`, `pdo_mysql`, `gd`, `bcmath`. الإضافات `curl`, `mbstring`, `openssl`, `PDO`, `tokenizer`, `dom`, `fileinfo`, `filter`, `hash`, `json`, `pcre`, `session`, `xml`, `SimpleXML`, `xmlreader`, `xmlwriter`, `zip`, `zlib`, `iconv`, `libxml` ظهرت في القائمة.

**النتيجة:** الصورة تحقق PHP 8.3 وComposer 2، لكنها ليست بيئة مثبتة ومكتملة لمتطلبات Bagisto. لم يُنفذ `composer create-project` ولم تُثبت إضافات داخلها. B1 ما زال محجوبًا إلى اعتماد بيئة مناسبة؛ فحص الامتدادات هنا للمرشح فقط وليس فحص صورة التطبيق المعتمدة لبقية B3.

### Phase B1 — بناء صورة PHP 8.3 — 2026-11-18

مصادر المتطلبات:

- [متطلبات Bagisto الرسمية وإضافات PHP](https://devdocs.bagisto.com/getting-started/before-you-start.html#php-extensions).
- [توقيع SHA-384 الرسمي لمثبت Composer](https://composer.github.io/installer.sig): `c8b085408188070d5f52bcfe4ecfbee5f727afa458b2573b8eaaf77b3419b0bf2768dc67c86944da1544f06fa544fd47`.

الوسم `php:8.3-cli` فُحص قبل السحب، وأُجيز سحب digest منصة amd64 التالي:

```text
sha256:48ed67e99726bbccd8ea1ce741dcf6b202263ad74bf70834a600fc37e401279e
```

أُضيف [Dockerfile](../../backend/docker/php/Dockerfile) بصورة أساس مثبتة بالـ digest، وإضافات PHP عبر `docker-php-ext-install`، ومثبت Composer 2.8.12 بعد التحقق من توقيع SHA-384 الرسمي.

الأوامر ونتائج التحقق:

```text
docker pull --platform=linux/amd64 php:8.3-cli@sha256:48ed67e99726bbccd8ea1ce741dcf6b202263ad74bf70834a600fc37e401279e
Digest: sha256:48ed67e99726bbccd8ea1ce741dcf6b202263ad74bf70834a600fc37e401279e
Status: Downloaded newer image

docker build --platform=linux/amd64 -t cf-php-bagisto:8.3 backend/docker/php
#6 /tmp/composer-setup.php: OK
#6 Composer (version 2.8.12) successfully installed to: /usr/local/bin/composer
#7 DONE — image exported and tagged as cf-php-bagisto:8.3

docker run --rm cf-php-bagisto:8.3 php -v
PHP 8.3.36 (cli) (built: Nov  5 2026 07:26:18) (NTS)

docker run --rm cf-php-bagisto:8.3 composer --version
Composer version 2.8.12 2025-09-19 13:41:59
PHP version 8.3.36 (/usr/local/bin/php)

docker run --rm cf-php-bagisto:8.3 php -m
bcmath
calendar
Core
ctype
curl
date
dom
fileinfo
filter
gd
hash
iconv
intl
json
libxml
mbstring
mysqlnd
openssl
pcre
PDO
pdo_mysql
pdo_sqlite
Phar
posix
random
readline
Reflection
session
SimpleXML
sodium
SPL
sqlite3
standard
tokenizer
xml
xmlreader
xmlwriter
Zend OPcache
zip
zlib

extension assertion
PASS: all 26 required PHP extensions are loaded.
```

**الحالة:** B1 مكتمل ومتحقق. لم يُنشأ `backend/bagisto`، ولم يُشغّل Composer لإنشاء مشروع، ولم تُثبت API، ولم تبدأ قاعدة بيانات. الخطوة التالية B2 لا تبدأ إلا بعد تأكيد المالك.
