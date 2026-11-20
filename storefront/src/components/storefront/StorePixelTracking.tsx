"use client";

import Script from "next/script";

const isSafePixelId = (value: string | null): value is string =>
  value !== null && /^[A-Za-z0-9_-]{1,64}$/.test(value);

export function StorePixelTracking({
  metaPixelId,
  tiktokPixelId,
}: {
  metaPixelId: string | null;
  tiktokPixelId: string | null;
}) {
  const metaId = isSafePixelId(metaPixelId) ? metaPixelId : null;
  const tiktokId = isSafePixelId(tiktokPixelId) ? tiktokPixelId : null;

  return (
    <>
      {metaId && (
        <>
          <Script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaId}');fbq('track','PageView');`,
            }}
            id="commerceforge-meta-pixel"
            strategy="afterInteractive"
          />
        </>
      )}
      {tiktokId && (
        <Script
          dangerouslySetInnerHTML={{
            __html: `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;var o=d.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktokId}');ttq.page()}(window,document,'ttq');`,
          }}
          id="commerceforge-tiktok-pixel"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
