# Bugfix Requirements Document

## Introduction

This document addresses critical authentication issues in the Next.js + Supabase application where Google OAuth authentication fails to properly authenticate users after redirect. Users click "Sign in with Google" but are not logged in after returning from Google OAuth, resulting in null sessions and failed authentication persistence.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN user clicks "Sign in with Google" and completes OAuth flow THEN the system fails to create a persistent session after redirect

1.2 WHEN user returns from Google OAuth callback THEN the system shows user as not authenticated (session is null)

1.3 WHEN user refreshes the page after successful OAuth THEN the system loses the session and user appears logged out

1.4 WHEN OAuth redirect fails silently THEN the system provides no error feedback or debug information to diagnose the issue

1.5 WHEN navbar-wrapper.tsx checks user authentication THEN the system uses incorrect Supabase client (createClient from @supabase/supabase-js instead of createBrowserClient from @supabase/ssr)

### Expected Behavior (Correct)

2.1 WHEN user clicks "Sign in with Google" and completes OAuth flow THEN the system SHALL create a persistent session with proper cookie storage

2.2 WHEN user returns from Google OAuth callback THEN the system SHALL successfully exchange the code for a session and authenticate the user

2.3 WHEN user refreshes the page after successful OAuth THEN the system SHALL maintain the session and keep the user authenticated

2.4 WHEN OAuth redirect fails or encounters errors THEN the system SHALL log detailed error information to console for debugging

2.5 WHEN navbar-wrapper.tsx checks user authentication THEN the system SHALL use createBrowserClient from @supabase/ssr for proper SSR cookie handling

### Unchanged Behavior (Regression Prevention)

3.1 WHEN user is already authenticated and navigates between pages THEN the system SHALL CONTINUE TO maintain their session state

3.2 WHEN OAuth callback successfully assigns staff roles from pending_staff_invites THEN the system SHALL CONTINUE TO perform role assignment logic

3.3 WHEN authentication errors occur THEN the system SHALL CONTINUE TO redirect to /auth/error page with error message

3.4 WHEN user accesses protected routes THEN the system SHALL CONTINUE TO enforce authentication requirements

3.5 WHEN Supabase environment variables are missing THEN the system SHALL CONTINUE TO handle gracefully without crashing
