# ADR-023 — تثبيت أساس Backend على Bagisto 2.4.10

**التاريخ:** 2026-11-18

**الحالة:** معتمد من المالك؛ التثبيت محجوب حتى اكتمال بوابات التحقق وتشغيل Docker Engine.

## السياق

يلزم تثبيت مجموعة إصدارات متوافقة قبل إنشاء Backend جديد. كان الوصف الأولي لنسخة Bagisto 2.5 قديمًا: تحقق Packagist في 2026-11-18 من وجود الإصدار المستقر 2.5.2. مع ذلك، يذكر README الخاص بـ `bagisto/bagisto-api` الإصدار 2.4.4 أنه يدعم خط Bagisto 2.4.x، ويحدد Bagisto 2.4.10 إصدارًا مختبرًا في CI؛ ولا يوثق دعم Bagisto 2.5. لذلك يبقى اختيار 2.4.10 هو الاختيار الأقل مخاطرة لهذا التأسيس، ويعاد تقييمه فقط عند توثيق توافق إصدار API مع خط Bagisto أحدث.

تختلف موضوعات أرقام ADR-003 وADR-009 وADR-011 المذكورة في مسودة المالك عن الموضوعات المسجلة بهذه الأرقام في المستودع. لذلك يحفظ هذا القرار مجموعة الإصدارات في ADR-023 ولا يعيد استخدام أرقام قائمة أو تغيير معانيها بصمت.

## القرار

| المكوّن | الإصدار/الاختيار | الملاحظات |
|---|---|---|
| Bagisto | `2.4.10` | رقم إصدار ثابت، وليس `2.4.*` |
| `bagisto/bagisto-api` | `2.4.4` | يذكر README التوافق مع Bagisto 2.4.x والاختبار على 2.4.10 |
| Laravel | `12.x` | `composer.json` للإصدار Bagisto 2.4.10 يطلب `laravel/framework: ^12.0` |
| PHP | `8.3` | يعمل داخل حاوية؛ متطلبات Bagisto هي `>=8.3 <8.5`، والـ API يطلب 8.3+ |
| Composer | `2.x` | يستخدم داخل بيئة الحاوية، لا على Ubuntu المضيف |
| قاعدة البيانات | MySQL `8.0` | اختيار مبدئي للتوافق الموثق مع API؛ تثبيت التشغيل ينتظر إكمال بوابة دعم المورّد أدناه |
| Node.js | `22 LTS` | أصلي داخل Ubuntu عبر nvm؛ ليس Node 25 الموجود على Windows |
| صورة Bagisto | `webkul/bagisto:2.4.10` | تحقق سجل Docker من وجود الوسم، ببيئتي `amd64` و`arm64` |
| صور Docker | وسوم إصدارات محددة | لا تستخدم `latest`؛ ثبّت الوسم الدقيق لكل خدمة في إعداد البيئة |

قوالب الواجهة الخمسة تبقى بالمعرّفات الرسمية في `config/templates/presets.json`، وتنتمي إلى عائلة تصميم/تنظيم داخلية باسم `lifestyle`. لا يضاف حقل `family` إلى JSON دون تعديل معتمد لمخططه.

## بوابة التحقق ونتائجها

| الفحص | النتيجة في 2026-11-18 | المصدر |
|---|---|---|
| وجود Bagisto 2.4.10 | متحقق في Packagist ووسم GitHub | [Packagist](https://packagist.org/packages/bagisto/bagisto) · [GitHub tag](https://github.com/bagisto/bagisto/tree/v2.4.10) |
| متطلبات PHP وLaravel | متحقق من `composer.json` للوسم: PHP `>=8.3 <8.5` وLaravel `^12.0` | [Bagisto composer.json](https://github.com/bagisto/bagisto/blob/v2.4.10/composer.json) |
| وجود API 2.4.4 وتوافقه | متحقق؛ README يذكر PHP 8.3+ وComposer 2 وBagisto 2.4.x واختبار CI على 2.4.10 | [API README v2.4.4](https://github.com/bagisto/bagisto/blob/v2.4.4/README.md) |
| متطلبات قاعدة البيانات للـ API | README يذكر MySQL 8.0+ أو PostgreSQL 14+؛ لذلك الادعاء أن PostgreSQL غير مدعوم غير صحيح. MariaDB غير مذكور ضمن هذه القائمة | [API README v2.4.4](https://github.com/bagisto/bagisto/blob/v2.4.4/README.md) |
| Bagisto 2.5 | ظهر الإصدار المستقر 2.5.2 على Packagist بتاريخ 2026-11-18؛ لكنه ليس اختيار هذا القرار لأن API 2.4.4 لا يوثق توافق 2.5 | [Packagist](https://packagist.org/packages/bagisto/bagisto) |
| وسم صورة Bagisto | `webkul/bagisto:2.4.10` موجود ويدعم `amd64` و`arm64`؛ لم تُسحب الصورة أو تُشغّل بعد | [Docker Hub tags](https://hub.docker.com/r/webkul/bagisto/tags) |
| قالب Bagisto الرسمي لـ Next.js | README يذكر Bagisto 2.4.x لكنه يسمي `Bagisto API v1.0.3`، وليس `bagisto/bagisto-api` 2.4.4؛ لا يُنسخ أو يعتمد قبل تدقيق منفصل | [Bagisto Next.js Commerce](https://github.com/bagisto/nextjs-commerce) |
| دعم MySQL 8.0 بتاريخ التثبيت | غير محسوم بعد: صفحة Oracle الرسمية متاحة لكن تعذر التحقق من صف MySQL 8.0 وتاريخ انتهاء مستوى الدعم في مصدر قابل للاقتباس أثناء هذا التدقيق | [Oracle Lifetime Support Policy](https://www.oracle.com/support/lifetime-support/) |
| حالة Docker Engine المحلي | محجوبة: Docker Desktop يعمل كعملية، لكنه يعرض `Docker Desktop is unable to start` و`docker info` لا يصل إلى Linux Engine | تحقق محلي؛ WSL kernel يحتاج فحصًا/تحديثًا يدويًا |
| وسوم صور التشغيل | `mysql:8.0.46` و`node:22.21.1-bookworm-slim` موجودان في السجل وقت الفحص؛ وسم PHP/Composer النهائي لم يُحسم | [MySQL Docker Hub](https://hub.docker.com/_/mysql) · [Node Docker Hub](https://hub.docker.com/_/node) |

## تصحيح أوامر التثبيت المقترحة

يجب تشغيل `composer create-project` من جذر المستودع حتى يكون مجلد الوجهة `backend/bagisto`؛ تشغيل الأمر من داخل `backend/` مع الوجهة نفسها ينشئ مسارًا متداخلًا بالخطأ. كما أن القرار يشترط تشغيل Composer وPHP داخل الحاويات، لا تنفيذ الأوامر على مضيف Ubuntu مباشرة.

أوامر تثبيت API بعد إنشاء مشروع Bagisto وتهيئته وتشغيل حاويته، من مجلد مشروع Laravel:

```bash
composer require bagisto/bagisto-api:2.4.4
php artisan bagisto-api-platform:install
php artisan bagisto-api-platform:optimize
```

الأمران الأخيران موثقان في README الخاص بالوسم 2.4.4. لا تنفذ الأوامر قبل تشغيل Backend وقاعدة البيانات والتحقق من بيئة الحاوية، ولا تضع أسرارًا في Git.

## النتائج

- لا نستخدم Bagisto 2.5 في هذا التأسيس ما لم يصدر دعم موثق من API المستخدم.
- MySQL هو الاختيار الأولي لأنه موثق صراحةً من API؛ لا نبدله بـ MariaDB لمجرد توافقه مع Bagisto دون توثيق توافق API ودعم المورّد.
- MySQL 8.0 هو خط الإصدار المختار، لكن وسم التصحيح `8.0.46` لا يعتمد للتشغيل إلا بعد إكمال بوابة دعم Oracle والتحقق منه وقت التشغيل.
- لا يعني وجود وسم Docker أن الحاوية قد سُحبت أو أن تشغيل التطبيق اختُبر.
- PHP وComposer داخل الحاويات؛ Node.js 22 يعمل أصليًا داخل Ubuntu.
- العملاء يظلون على عمليات نشر وقواعد بيانات وأسرار منفصلة.

## ما تبقى قبل التثبيت

1. توثيق دعم Oracle الفعلي لـ MySQL 8.0 في تاريخ التثبيت. إذا انتهى دعم المورّد الملائم، يوقف التثبيت ويعاد تقييم MySQL مقابل MariaDB 10.11 مع اختبار Bagisto وAPI فعليًا.
2. تحديث WSL kernel يدويًا عند الحاجة، ثم تشغيل Docker Desktop والتحقق من `docker info`.
3. إعداد Docker Compose بوسوم صور مثبتة وإعدادات محلية لا تحتوي أسرارًا ملتزمة بالمستودع.
4. تثبيت Node.js 22 في Ubuntu عبر nvm والتحقق من `node --version` و`npm --version`.
5. إنشاء Bagisto في `backend/bagisto` ثم تثبيت API 2.4.4 داخل البيئة الحاوية.
6. تشغيل فحوص Composer وLaravel وقاعدة البيانات وواجهات API وتسجيل نتائجها.

## إعادة النظر

تُراجع هذه الوثيقة عند تحقق الشرطين معًا: إصدار Bagisto أحدث مستقر، وإصدار `bagisto-api` يذكر صراحةً دعمه واختباره معه. أي تغيير للإصدارات أو قاعدة البيانات يحتاج ADR ومجموعة اختبارات قبل ترقية متجر عميل.

## تحديث حالة البوابات وخطة Phase 1 — 2026-11-18

هذا الملحق يضيف نتائج تحقق حديثة ولا يحذف أو يختصر القرار أو نتائجه السابقة. لم تُسحب أي صورة Docker، ولم يُشغّل Composer، ولم يُنشأ مشروع Bagisto.

### نتائج البوابات

| البوابة | الحالة | المصدر والتاريخ | الدليل/الناتج |
|---|---|---|---|
| G1 — Docker Engine | **PASS — تقرير المالك** | إفادة المالك في المحادثة، 2026-11-18 | النص الذي قدمه المالك: `docker info succeeds (Server Version 29.9.3)`. لم يرفق المالك مخرجات `docker info` الخام كاملة؛ لا تُنسب إليه أسطر أخرى. |
| G2 — Bagisto 2.4.10 | **PASS** | [Packagist](https://packagist.org/packages/bagisto/bagisto)، [GitHub release](https://github.com/bagisto/bagisto/releases/tag/v2.4.10)، [composer.json عند الوسم](https://github.com/bagisto/bagisto/blob/v2.4.10/composer.json)، تحقق 2026-11-18 | Packagist وGitHub يثبتان الوسم `v2.4.10`؛ مرجع Git `72beea139e644e9e1b6981b717d57dfa68ad3106`. `php: >=8.3 <8.5`; `laravel/framework: ^12.0`. |
| G3 — Bagisto API 2.4.4 | **PASS** | [Packagist](https://packagist.org/packages/bagisto/bagisto-api)، [README عند الوسم v2.4.4](https://github.com/bagisto/bagisto-api/blob/v2.4.4/README.md)، تحقق 2026-11-18 | الإصدار `v2.4.4` موجود؛ README يذكر PHP 8.3+ وComposer 2 وBagisto v2.4.x مختبرًا في CI على v2.4.10. كما يسرد MySQL 8.0+ أو PostgreSQL 14+. |
| G4 — وسم صورة Bagisto | **PASS — فحص registry فقط** | [Docker Hub](https://hub.docker.com/r/webkul/bagisto/tags)، تحقق 2026-11-18 | الأمر `docker manifest inspect webkul/bagisto:2.4.10` أعاد `schemaVersion: 2` ومنصتي Linux `amd64` و`arm64`. لم يُنفذ `docker pull`. |
| G5 — دعم Oracle لـ MySQL 8.0 | **OPEN** | [Oracle Lifetime Support Policy](https://www.oracle.com/support/lifetime-support/)، تحقق 2026-11-18 | لم أتمكن من تأكيد صف MySQL 8.0 وتاريخ/مستوى الدعم من المصدر الرسمي؛ تبقى البوابة مفتوحة، ولا يبدأ MySQL قبل حسمها واختيار المالك لقاعدة البيانات. |
| G6 — Bagisto Next.js Commerce | **PASS — دعم خط الإصدار فقط** | [README على main](https://github.com/bagisto/nextjs-commerce/blob/main/README.md)، [package.json على main](https://github.com/bagisto/nextjs-commerce/blob/main/package.json)، تحقق 2026-11-18 | README يحدد Bagisto `v2.4.x`، فيشمل خط الإصدار 2.4.10؛ لكنه يحدد API `v1.0.3`، وليس `bagisto/bagisto-api` `2.4.4`. `package.json` الحالي يعرّف `bagisto-headless-v3` مع Next `^16.2.9` وReact `^19.2.7` وNode `>=20`. توافق كود هذا القالب مع API 2.4.4 غير مثبت؛ لا تعتمد واجهته دون تحقق تكامل مستقل. |
| G7 — قاعدة البيانات وتعارض الدعم | **OPEN — قرار المالك مطلوب** | [Bagisto System Requirements](https://devdocs.bagisto.com/getting-started/before-you-start.html#system-requirements)، [API README v2.4.4](https://github.com/bagisto/bagisto-api/blob/v2.4.4/README.md)، تحقق 2026-11-18 | وثائق Bagisto الحالية تسرد MySQL 8.0 وMariaDB 10.11 وPostgreSQL 16، وتذكر أن Bagisto 2.4 لا يدعم PostgreSQL. README API 2.4.4 يسرد MySQL 8.0+ وPostgreSQL 14+، ولا يسرد MariaDB. يلزم اختيار المالك وعدم استنتاج دعم متبادل غير موثق. |

### متطلبات PHP وRedis من وثائق Bagisto

تسرد صفحة [Bagisto System Requirements](https://devdocs.bagisto.com/getting-started/before-you-start.html#php-extensions) الإضافات التالية:

- متطلبات `composer.json`: `calendar`, `curl`, `intl`, `mbstring`, `openssl`, `pdo`, `pdo_mysql`, `tokenizer`.
- متطلبات شاشة التثبيت: `ctype`, `dom`, `fileinfo`, `filter`, `gd`, `hash`, `json`, `pcre`, `session`, `xml`.
- تبعيات Composer قد تغيب عن بعض حزم PHP: `bcmath`, `iconv`, `libxml`, `simplexml`, `xmlreader`, `xmlwriter`, `zip`, `zlib`.
- `pdo_pgsql` يخص خيار PostgreSQL؛ و`imagick` مطلوب فقط إذا اختير `IMAGE_DRIVER=imagick`.
- تصف الوثائق Redis بأنه خدمة اختيارية للكاش والجلسات والـ queues وfull-page cache، وتذكر `predis` كبديل PHP عند ضبط `REDIS_CLIENT=predis`.

هذه قائمة المتطلبات من الوثائق، وليست نتيجة فحص للصورة. **لم تُسحب أو تُفحص صورة التطبيق، لذلك لم يُثبت بعد وجود كل extension داخل الصورة أو صورة Sail المبنية.**

### مراجعة خيار Docker الرسمي

المصدر الرسمي المتاح عند وسم Bagisto 2.4.10 هو [docker-compose.yml](https://github.com/bagisto/bagisto/blob/v2.4.10/docker-compose.yml). يستخدم خدمة تطبيق مبنية من `vendor/laravel/sail/runtimes/8.3`، وMySQL، وRedis، وElasticsearch، وKibana، وMailpit. وهو ليس أمر إنشاء المشروع؛ أمر إنشاء المشروع الرسمي يبقى `composer create-project bagisto/bagisto backend/bagisto "2.4.10"` من جذر المستودع، مع تشغيل PHP وComposer داخل حاوية متوافقة.

لا يصلح تشغيل Compose كما هو دون مراجعة، لأنه:

- يضم Redis وElasticsearch وKibana رغم أن خدمات البحث وRedis اختيارية بحسب صفحة المتطلبات.
- يستخدم `mysql/mysql-server:8.0` و`axllent/mailpit:latest`، ولا يثبت كل وسوم الصور على إصدار patch.
- ينشر منافذ التطبيق وقاعدة البيانات وMailpit دون تقييدها صراحةً على `127.0.0.1`؛ كما أن منافذ Elasticsearch/Kibana ثابتة على كل واجهات المضيف.
- يحتوي volume مسمى `sail-mysql`، وهو ملائم لاستمرار بيانات MySQL.

أي Compose override لتقييد المنافذ وتثبيت الصور وإزالة الخدمات الاختيارية يحتاج اقتراحًا وموافقة مالك وفق ADR-012 قبل إنشائه. لم يُكتب Dockerfile أو Nginx config أو Compose override.

### خطة تحضير Phase 1 — تتوقف قبل التثبيت

#### أ. المصدر والأمر الرسمي

- مرجع Docker الرسمي المثبت للإصدار: [Bagisto 2.4.10 docker-compose.yml](https://github.com/bagisto/bagisto/blob/v2.4.10/docker-compose.yml).
- أمر الإنشاء الرسمي المراد تشغيله لاحقًا داخل PHP 8.3/Composer 2 container ومن جذر المستودع:

```bash
composer create-project bagisto/bagisto backend/bagisto "2.4.10"
```

- لا تنشئ المجلد أو المشروع يدويًا، ولا تشغل الأمر قبل الموافقات أدناه.

#### ب. فحص PHP extensions

بعد موافقة المالك على تنزيل/بناء الصورة التي سيستخدمها التطبيق، تُفحص قائمة الإضافات أعلاه بالأمر `php -m` داخل **صورة التطبيق الفعلية**، وتُقارن مع متطلبات Bagisto. لا يكفي فحص `webkul/bagisto:2.4.10` وحده إذا كان Compose سيشغل صورة Sail مختلفة.

#### ج. مخطط المنافذ والتخزين المقترح

بعد الموافقة على Compose override مناسب:

| الخدمة | ربط المضيف المقترح | التخزين |
|---|---|---|
| تطبيق Bagisto | `127.0.0.1:8000` | ملفات المشروع في `backend/bagisto` |
| MySQL إذا اختير | `127.0.0.1:3306` عند الحاجة لاتصال أدوات المضيف؛ الاتصال الداخلي عبر شبكة Compose | volume مسمى `sail-mysql` |
| Mailpit SMTP | `127.0.0.1:1025` | لا يحتاج volume دائمًا للتطوير الأولي |
| Mailpit UI | `127.0.0.1:8025` | لا يحتاج volume دائمًا للتطوير الأولي |

القيم أعلاه اقتراح تخطيط فقط، وليست إعدادات منفذة. Compose الرسمي الحالي لا يربط كل هذه المنافذ محليًا، لذلك يلزم اعتماد التعديل قبل تشغيل الخدمات. لا يبدأ MySQL قبل اختيار قاعدة البيانات وحل G5/G7.

#### د. Redis

لا يضاف Redis إلى الحد الأدنى المعتمد باعتباره اعتمادًا إلزاميًا؛ صفحة Bagisto تصفه بأنه اختياري. لكن Compose الرسمي يضم خدمة Redis ويضعها ضمن `depends_on`. لذا يلزم قرار المالك بين تشغيل خيار Compose الرسمي كما هو مع Redis الاختياري، أو الموافقة على override/خيار رسمي آخر لإزالته. لا تُشغّل Redis ولا تغيّر ADR-012 بصمت.

#### هـ. اختيار قاعدة البيانات

يلزم قرار المالك: MySQL 8.0 أو MariaDB 10.11 أو PostgreSQL. تقاطع التوافق الموثق صراحةً بين Bagisto 2.4.10 وAPI 2.4.4 هو MySQL 8.0. MariaDB مدرج في وثائق Bagisto الحالية لكنه غير مدرج في متطلبات API 2.4.4؛ وPostgreSQL مدرج في API لكن وثائق Bagisto تقول إن Bagisto 2.4 لا يدعمه. لا يعتمد بديل حتى يسجل المالك الاختيار أو يصدر ADR جديدًا عند الحاجة.

#### و. الأوامر المخطط لها بالترتيب — كلها تحتاج موافقة منفصلة قبل التنفيذ

1. **فحص Git للقراءة فقط:** `git status --short --branch`.
2. **سحب صورة PHP/Composer مثبتة ومتوافقة:** يحدد اسم الوسم النهائي بعد التحقق من احتوائها PHP 8.3 وComposer 2؛ يحتاج موافقة صريحة على السحب، خصوصًا أن حجم الصورة قد يتجاوز 100 MB.
3. **فحص إصدارات الحاوية:** `docker run --rm <php-composer-image> php -v` ثم `docker run --rm <php-composer-image> composer --version`.
4. **إنشاء Bagisto عبر Composer الرسمي من جذر المستودع:** `composer create-project bagisto/bagisto backend/bagisto "2.4.10"` داخل الحاوية المعتمدة؛ يحتاج موافقة صريحة على الإنشاء والتنزيلات.
5. **فحص إعداد Compose دون تشغيل الخدمات:** `docker compose config` من `backend/bagisto` بعد مراجعة أي تعديل معتمد.
6. **بناء صورة تطبيق Sail 8.3 وفحص الامتدادات:** `docker compose build laravel.test` ثم `docker compose run --rm laravel.test php -m`; يحتاج موافقة على بناء/سحب الصور.
7. **تشغيل الخدمات المحلية:** `docker compose up -d`; لا ينفذ قبل قرار قاعدة البيانات ومراجعة المنافذ والـ volumes والخدمات الاختيارية، ويحتاج موافقة صريحة على تنزيل الصور وتشغيل MySQL أو البديل.
8. **تثبيت API:** `docker compose exec laravel.test composer require bagisto/bagisto-api:2.4.4`; يحتاج موافقة صريحة على Composer والتنزيلات.
9. **تهيئة API وتحسين الكاش:** `docker compose exec laravel.test php artisan bagisto-api-platform:install` ثم `docker compose exec laravel.test php artisan bagisto-api-platform:optimize`.
10. **التحقق والتسجيل:** `docker compose exec laravel.test php artisan test` وطلبات تحقق API بعد اعتماد معايير الاختبار.

**لا ينفذ أي أمر في القائمة من 2 إلى 10 في هذه الجلسة.** الإصدارات الدقيقة لصور PHP/Composer وقرار Compose override ما زالا معلقين؛ لا تستخدم placeholder كما لو أنه أمر جاهز.

### القرارات المطلوبة من المالك

1. اختيار قاعدة البيانات بين MySQL 8.0 وMariaDB 10.11؛ وبيان ما إذا كان PostgreSQL خارج الاختيارات الحالية أو يحتاج ADR جديدًا.
2. لصق المخرجات الخام لـ `docker info` إن أراد تسجيل دليل G1 كاملًا؛ المسجل حاليًا هو تقريره `Server Version 29.9.3`.
3. الموافقة لاحقًا على سحب صورة التطبيق/صورة PHP-Composer بعد تأكيد الوسوم والأحجام، وعلى بناء صورة Sail.
4. استعادة/توفير `docs/architecture/FILE_STRUCTURE.md`؛ الملف المشار إليه كبنية skeleton v2.2 غير موجود في المستودع الحالي.
5. تحديد هل يوافق على Compose override محدود يربط المنافذ بـ localhost ويثبت الصور ويعالج Redis/Elasticsearch الاختياريين؛ لا تعديل على ADR-012 قبل الموافقة.

### توضيح أوامر الحاوية المرشحة — 2026-11-18

لتجنب ترك اسم صورة مبهم في القائمة السابقة، صورة Composer المرشحة للفحص فقط هي `composer:2.8.12`. وسمها موجود في Docker registry، لكن لم تُسحب ولم يتم التحقق من نسخة PHP داخلها. لا يُستخدم لإنشاء المشروع إلا إذا أثبت الفحص أنه يشغل PHP 8.3 وComposer 2؛ خلاف ذلك يتوقف العمل ويُطلب اعتماد صورة بديلة.

بعد موافقة المالك الصريحة على سحب الصورة، تكون الأوامر المرشحة من جذر المستودع داخل Ubuntu:

```bash
docker pull composer:2.8.12
docker run --rm composer:2.8.12 php -v
docker run --rm composer:2.8.12 composer --version
```

إذا كانت PHP في الصورة `8.3.x` وComposer 2، وبعد موافقة منفصلة على إنشاء المشروع والتنزيلات:

```bash
docker run --rm -v "$PWD:/app" -w /app composer:2.8.12 create-project bagisto/bagisto backend/bagisto "2.4.10"
```

هذا الأمر متوافق مع قيد الإنشاء عبر Composer الرسمي، لكنه لا يُشغّل الآن. لا يُنفذ إذا لم تحقق الصورة PHP 8.3. بناء صورة التطبيق وفحص إضافاتها يكون لاحقًا عبر Compose الرسمي بعد مراجعة وإقرار مشكلة `latest` والمنافذ والخدمات الاختيارية؛ ولا يُسحب أو يُبنى شيء حتى يوافق المالك.

### تحقق صورة Composer المعتمدة وحالة B1 — 2026-11-18

- دليل Bagisto الرسمي يوصي بـ `composer create-project bagisto/bagisto <directory>` ويشرح إضافة قيد الإصدار: [دليل التثبيت](https://devdocs.bagisto.com/getting-started/installation.html). رابط الدليل موجود أيضًا في [README عند الوسم v2.4.10](https://github.com/bagisto/bagisto/blob/v2.4.10/README.md).
- أفاد `docker info --format '{{.ServerVersion}}'` بإصدار Docker Server `29.9.3`. كان `backend/bagisto` غير موجود قبل المحاولة.
- بعد موافقة المالك، سُحبت `composer:2.8.12`؛ digest: `sha256:5248900ab8b5f7f880c2d62180e40960cd87f60149ec9a1abfd62ac72a02577c`.
- الفحص داخل الصورة أعاد PHP `8.4.14` وComposer `2.8.12`؛ لذلك لا تطابق الصورة تثبيت PHP `8.3` في هذا القرار.
- **B1: BLOCKED** — لم يُنفذ أمر الإنشاء. لم يُنفذ Composer require أو أوامر API Artisan ولم يُفحص `php -m`.
- لا يتغير تثبيت PHP في هذا ADR دون قرار/ADR جديد. يلزم من المالك اعتماد صورة مثبتة توفر PHP 8.3 وComposer 2، أو الموافقة على تعديل قرار الإصدار. قاعدة البيانات لم تُشغّل؛ اختيارها ما زال مطلوبًا قبل B4.
