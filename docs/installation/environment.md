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
