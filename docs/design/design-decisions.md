# CollabDebug — Design Decisions

## Why dark mode?
Developer tools are used for long sessions, often late at night.
Dark mode reduces eye strain significantly during extended debugging
sessions. It also makes colored syntax highlights and status indicators
(red, green, blue) pop more clearly against the background, which is
critical when scanning live debug data quickly.

## Why this two-column layout?
The left column holds static inspection data (breakpoints, variables)
that the user references repeatedly but doesn't scroll through.
The right column holds the live feed which grows over time and needs
scroll space. Separating them means your eye always knows where to
look — left for state, right for events.

## What each color means
- **Electric blue (#4f8ef7)** — Primary actions, links, focus rings.
  Anything the user initiates.
- **Red/pink (#f75d7e)** — Your identity color. Your cursor, your
  breakpoints, your changes. Instantly distinguishable from M2.
- **Green (#3ecf8e)** — M2's identity color. Also used for success
  states and connected status because green universally means "good".
- **Amber (#f7b955)** — Warnings and variable change events. Draws
  attention without alarm.
- **Muted gray (#6b7494)** — Timestamps, labels, secondary info.
  Recedes so the important data stands out.

## Why Plus Jakarta Sans?
Most dev tools use Inter or system fonts. Plus Jakarta Sans has
slightly more personality — rounded but still professional. It makes
the UI feel modern and polished without looking like every other
developer dashboard. JetBrains Mono is used for all code and
file names because it is the gold standard for developer readability.

## Why glassmorphism on the home card?
The frosted glass effect on the HomePage card creates visual depth
without using heavy shadows or gradients throughout the app. It is
used only on the entry point — the one moment where a user forms
their first impression. The rest of the app uses flat surfaces to
keep the interface fast and scannable during active debugging.