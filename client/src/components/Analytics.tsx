import React from 'react';

interface AnalyticsProps {
  gtmId?: string;
  gaId?: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ gtmId, gaId }) => {
  return (
    <>
      {/* Google Tag Manager */}
      {gtmId && (
        <>
          <script dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `
          }} />
          <noscript dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
            height="0" width="0" style="display:none;visibility:hidden"></iframe>`
          }} />
        </>
      )}

      {/* Google Analytics */}
      {gaId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
          <script dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_title: document.title,
                page_location: window.location.href,
                send_page_view: true
              });
            `
          }} />
        </>
      )}

      {/* Structured Data for Organization */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Tola Tiles",
          "url": "https://tolatiles.com",
          "logo": "https://tolatiles.com/assets/logo.png",
          "sameAs": [
            "https://www.facebook.com/tolatiles",
            "https://www.instagram.com/tolatiles",
            "https://www.linkedin.com/company/tolatiles"
          ]
        })
      }} />
    </>
  );
};

export default Analytics;