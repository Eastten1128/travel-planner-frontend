# Frontend UX Overview

## Application Shell (`src/App.js`)
- Checks the current session by requesting `GET /api/users/me`.
- Routes users into three flows:
  - **Loading**: shows a spinner while verifying the session.
  - **Onboarding (`AdditionalInfo`)**: triggered when the backend marks the account as a first-time login or when no nickname is set.
  - **Dashboard (`MainPageA`)**: displayed once profile setup is complete and the user is signed in.
  - **Landing (`MainPageB`)**: default view for visitors who are not signed in or when session lookup fails.
- Uses `window.location.href` redirects for Google OAuth login and backend-driven logout to stay aligned with the SSO flow.

## Logged-out Landing (`src/pages/MainPageB.js`)
- Presents marketing copy, navigation anchors, and a destination search form.
- The primary CTA is the **Google 로그인** button, which redirects to the backend OAuth endpoint.
- Highlights sample itineraries and an embedded Google Map to preview the planner experience.
- Surfaces authentication errors returned from the session check under the hero description.

## Onboarding (`src/pages/AdditionalInfo.js`)
- Guides first-time users through nickname, contact, and travel-style collection.
- Submits data to `POST /api/users/profile` and returns to the dashboard once saved.
- Provides a top-bar logout option that links back to the backend logout endpoint.

## Logged-in Dashboard (`src/pages/MainPageA.js`)
- Loads travel plans, group invitations, and AI recommendations in parallel on mount.
- Displays summary counts, detailed cards, and collaboration/AI sections mirroring the `dev/sso&main_page` experience.
- Offers quick actions for creating new plans (placeholder alert), refreshing data, and logging out.
- Shows empty, loading, and error states matching the original dev branch behaviors.

## Interaction Flow
1. Visitor lands on `MainPageB` and selects **Google 로그인**.
2. Backend completes OAuth and returns to the app; `App` fetches session data.
3. First-time users fill out the onboarding form and submit to continue.
4. Returning users see `MainPageA`, monitor their plans, and can log out or refresh data.

