# خارطة التطوير

تتبع الخارطة ترتيب المواصفات الرئيسية. حالات التقدم الفعلية موجودة في [PROJECT_STATUS.md](PROJECT_STATUS.md)، وقرارات الإصدارات في [ADR-023](docs/decisions/ADR-023-backend-stack.md).

1. **Phase 0 — Full Repository Audit:** مراجعة المستودع والتبعيات والبيئة والأمان والاختبارات. اكتمل التدقيق الأولي، ولا يبدأ أي تثبيت دون جاهزية البيئة.
2. **Phase 1 — Architecture Foundation:** اعتماد الإصدارات والعقود وبنية التطبيقات والإعدادات والمصادقة وحدود عزل كل عميل.
3. **Phase 2 — Client Admin Dashboard:** إنشاء لوحة العميل بـ Next.js/React وربطها بواجهات Bagisto المتحقق منها، دون استبدالها بلوحة Bagisto.
4. **Phase 3 — Business Analytics:** بيانات المبيعات وCOGS والمصروفات والأرباح وفق معادلات موثقة.
5. **Phase 4 — Meta Integration:** ربط آمن لكل عميل، واختيار الأصول، وقراءة الحملات والإنفاق والمقاييس المتاحة.
6. **Phase 5 — Theme Engine:** سجل القوالب والإعدادات والمكونات المشتركة والقوالب القطاعية.
7. **Phase 6 — Fashion Template:** اقتراح اتجاه بصري للموافقة، ثم التنفيذ واختبار رحلة الشراء.
8. **Phase 7 — Remaining Templates:** Furniture وElectronics وGrocery وLocal Brand بتجارب متمايزة.
9. **Phase 8 — Client Customization & Delivery:** إعدادات العلامة التجارية والنطاق والنشر المستقل والنسخ الاحتياطي وإصدارات Core.
10. **Phase 9 — Complete Testing:** اختبارات Backend وFrontend وE2E والأمان وRTL/LTR وعزل العملاء.
11. **Phase 10 — Documentation & Release:** أدلة التشغيل والنشر والتكامل والإصدار، وتقرير صريح بالمنجز والمختبر والمحجوب.

لا تمثل أرقام المراحل موافقة على حذف أو استبدال ملفات موجودة. يلزم الحفاظ على إصدارات العملاء مستقلة، ولا يتم ترقية Bagisto أو Core تلقائيًا.
