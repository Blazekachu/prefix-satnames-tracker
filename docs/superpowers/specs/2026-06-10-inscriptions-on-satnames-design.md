# Inscriptions On Satnames Design

Date: 2026-06-10
Project: Prefix Satnames Tracker

## Goal

Add a static page at `/inscriptions-on-satnames` that lists known satnames carrying inscriptions. The first version is a curated registry, not an automated discovery engine.

## Initial Entries

### agooddoctor

- Sat: `1917572203052608`
- Satname: `agooddoctor`
- Sat page block: `758115`
- Sat page timestamp: `2022-10-11 00:47:45 UTC`
- Sat page rarity: `common`
- Inscription ID: `fcfdefb824c1a0efbaa59663f649cb36d9891d78a0f50ec3a1b5c2f1e034269di0`
- Inscription number: `70826886`
- Inscription content type: `video/mp4`
- Inscription content length: `3967901 bytes`
- Inscription timestamp: `2024-05-16 22:12:33 UTC`
- Inscription height: `843764`
- On-chain metadata: `Creator = A Good Doctor Studios`, `Socials = https://x.com/AGoodDoctoor`, `Inscribed By = OrdinalsBot`
- Relationship: no parents found through `/r/parents/...`; one direct child found through `/r/children/.../0`
- Direct child: `2312dc77afc774cecac54ab83da4b799d1a14707f79ff51ee892069ded7b7126i0`, inscription number `71411965`, content type `image/png`, metadata description, and `420` visible children.

### excrescence

- Sat: `1263083605557421`
- Satname: `excrescence`
- Sat page block: `295233`
- Sat page timestamp: `2014-04-11 09:53:32 UTC`
- Sat page rarity: `common`
- Inscription ID: `07d3229fb454ff55117c675d6a0571f2e61ec2ff1deebc769e5b19aebdf0377ei5`
- Inscription number: `91759015`
- Inscription content type: `text/html;charset=utf-8`
- Inscription content length: `5143 bytes`
- Inscription timestamp: `2025-03-28 16:45:48 UTC`
- Inscription height: `889853`
- Relationship: one parent found through `/r/parents/...`; no direct children found through `/r/children/.../0`
- Parent: `d30a35910fdb73c1eb97b6b06fe70c8c0dd40b621e7fe6f1bbeab9ac4616356fi1`, inscription number `71017875`, metadata title `Ephemera Kit / Collection`, and `332` visible children.
- On-chain metadata includes `Call Sign = CORALBENEFIT`, `Serial Number = IAEK-0277`, `CAL Code = 2014-0411-0953`, `Operating System = 0.0.6`, and ephemerides. The page should summarize a few top-level fields and link to ordinals for the full metadata instead of reproducing the whole nested ephemerides block.

### blobnwthems

- Sat: `1749358685270167`
- Satname: `blobnwthems`
- Sat page block: `559486`
- Sat page timestamp: `2019-01-21 15:25:26 UTC`
- Sat page rarity: `common`
- Inscription ID: `648f02fbb36d7841dbf629966ea9c82a60255044fbdd09b31533c0b9fafa573di0`
- Inscription number: `63959577`
- Inscription content type: `image/png`
- Inscription content length: `43423 bytes`
- Inscription timestamp: `2024-03-10 11:28:08 UTC`
- Inscription height: `834034`
- On-chain metadata: `name = Blobs`
- Relationship: one parent found through `/r/parents/...`; `10000` visible children found through `/children/...`
- Parent: `3d0150aad3743d698616f2917dbe217b96a41a3b039dc8bccb22ec9d430450fci0`, inscription number `63948282`, metadata `Blob`, image/webp, and `2` visible children.
- ART on Blockchain notes describe Blobs as a 10000-item interactive 3D GPU-shader collection generated from each inscription's own on-chain CBOR metadata through a recursive on-chain engine stack.

## Page Requirements

- Add route `/inscriptions-on-satnames`.
- Add a link from the home page to this new page.
- Render each entry as an asset-first card:
  - Default state shows only the inscribed asset preview and satname, with a short role label below/alongside it.
  - Clicking/opening the asset reveals sat facts, inscription facts, relationship facts, metadata highlights, and ordinals links.
- Clearly separate on-chain facts from future external/social links.
- Avoid unverifiable collection marketing copy.

## Future Additions

The registry can grow by user submissions, manual research, or a future search/trace engine. Automated discovery is out of scope for this first page.

## Testing

- Run `npx tsc --noEmit`.
- Run `npm test`.
- Run `npm run build`.
- Review locally on the dev server before any push.
