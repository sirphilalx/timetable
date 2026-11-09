# Rationale: Parental consent web companion · spec 0006

## Context

Under the Nigeria Data Protection Act (NDPA) 2023, university freshmen under 18 (common among 100L students in Nigeria) require verifiable parental or guardian consent before personal records (attendance answers, group memberships, notes) are persisted to cloud storage, and no ads may be shown to minors.

## Decision

We enforce age calculation (`src/lib/consent.ts`) before account persistence, lock unapproved minor accounts to read-only class previews (`Screens/14`), and serve a fast, zero-native-dependency parent approval web page at `/consent/[token]` (`Screens/15`) that works in WhatsApp's in-app browser and Cloudflare Pages static export.
