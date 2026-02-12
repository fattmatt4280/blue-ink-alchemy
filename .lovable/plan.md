

## Add Traffic Source & Campaign Tracking

### Overview
Enhance the analytics system to capture UTM parameters from your Meta campaign URLs and show a traffic sources breakdown in the admin dashboard. This will tell you where visitors come from, which campaign drove them, and what devices they use.

### What You'll See in Admin

A new "Traffic Sources" section in the Analytics tab showing:
- **Top referrer domains** (Facebook, Instagram, Google, Direct, etc.) as a pie chart
- **UTM campaign breakdown** (which Meta ad set or campaign is performing)
- **Device type split** (Mobile vs Desktop vs Tablet) -- critical for Meta since most traffic is mobile
- **Landing page performance** (which pages your ad traffic lands on)
- **Top pages viewed** per traffic source

### Changes

#### 1. Fix UTM Capture: `src/components/AnalyticsTracker.tsx`
- **Stop stripping UTM params**: When saving `event_data`, extract and preserve `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and `utm_term` from the current URL before anonymizing
- **Parse referrer domain**: Extract just the hostname from `document.referrer` (e.g. "facebook.com", "l.facebook.com") and store it as `referrer_domain` in event_data
- **Detect device type**: Use a simple check on `navigator.userAgent` to classify as "mobile", "tablet", or "desktop" and store in event_data
- The page URL will still be anonymized (no PII), but UTM params will be saved separately as structured fields

#### 2. New Component: `src/components/TrafficSourcesChart.tsx`
A dashboard card that queries `analytics_events` and groups data by:
- `referrer_domain` (pie chart of traffic sources)
- `utm_campaign` (bar chart of campaign performance)
- `device_type` (pie chart: mobile vs desktop)
- `landing_page` (table of top landing pages with visit counts)

Uses the same time range selector as the existing analytics dashboard.

#### 3. Update Analytics Dashboard: `src/components/AnalyticsDashboard.tsx`
- Add a new "Traffic Sources" tab alongside Revenue, Website Traffic, and Demographics
- Include the new `TrafficSourcesChart` component

### Data Stored in `analytics_events.event_data` (JSON)

For each page view, the event_data will now include:

| Field | Example | Source |
|---|---|---|
| `utm_source` | "facebook" | URL param from Meta ad |
| `utm_medium` | "paid_social" | URL param |
| `utm_campaign` | "free_budder_feb" | URL param |
| `utm_content` | "video_ad_1" | URL param |
| `utm_term` | "tattoo aftercare" | URL param |
| `referrer_domain` | "l.facebook.com" | Parsed from document.referrer |
| `device_type` | "mobile" | Parsed from user agent |
| `landing_page` | "/free-budder" | Current pathname |

### How Your Meta Campaign URLs Should Look

When setting up your Meta ads, use URLs like:
```
https://bluedreambudder.com/free-budder?utm_source=facebook&utm_medium=paid_social&utm_campaign=free_budder_feb&utm_content=video_ad_1
```

Meta Ads Manager can auto-append these via the "URL Parameters" field in ad setup.

### Technical Details

- No database schema changes needed -- UTM data goes into the existing `event_data` JSON column on `analytics_events`
- The `anonymizeURL` function will still strip query params from the stored `page_url` field (for privacy), but UTMs are extracted first and stored as separate fields in `event_data`
- Device detection uses a lightweight regex on user agent (no external library needed)
- All new charts use the same Recharts library already installed

### Files Modified
1. `src/components/AnalyticsTracker.tsx` -- capture UTMs, referrer domain, device type
2. `src/components/TrafficSourcesChart.tsx` -- new dashboard component (created)
3. `src/components/AnalyticsDashboard.tsx` -- add Traffic Sources tab

