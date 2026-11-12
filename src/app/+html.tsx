import React, { type PropsWithChildren } from "react";
import { ScrollViewStyleReset, useServerDocumentContext } from "expo-router/html";

const SITE_URL = "https://studenttimetable.app";
const SITE_TITLE = "TT: Student Timetable — Your class, your timetable, on time.";
const SITE_DESCRIPTION =
  "One shared link from your course rep puts every lecture, venue change, assignment, CBT exam, and reading session on your phone—with reminders that work even when data is off.";
const OG_IMAGE_URL = `${SITE_URL}/og-preview.png`;

export default function RootHtml({ children }: PropsWithChildren) {
  const { bodyAttributes, bodyNodes, htmlAttributes, headNodes } = useServerDocumentContext();

  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Primary Page Title & Description */}
        <title>{SITE_TITLE}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="application-name" content="TT: Student Timetable" />
        <meta name="apple-mobile-web-app-title" content="TT: Student Timetable" />
        <meta name="theme-color" content="#4F46E5" />
        <link rel="canonical" href={SITE_URL} />

        {/* Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* Open Graph (WhatsApp, iMessage, Facebook, LinkedIn, Telegram, Discord, Slack) */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="TT: Student Timetable" />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:image" content={OG_IMAGE_URL} />
        <meta property="og:image:secure_url" content={OG_IMAGE_URL} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="TT: Student Timetable landing page showing Today view, Course Rep QR sharing, and Classes calendar on iPhone"
        />

        {/* Twitter / X Large Summary Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={SITE_URL} />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE_URL} />
        <meta
          name="twitter:image:alt"
          content="TT: Student Timetable — Your class, your timetable, on time."
        />

        <ScrollViewStyleReset />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
