# SHORTSinSHORT user profiles

The website now supports Google profile creation through Firebase Authentication and stores one protected Firestore record per registered viewer.

## What the owner can see

When `equaltales@gmail.com` signs in, the profile panel can count:

- all registered profiles
- profiles with `membershipStatus: active`
- profiles with `membershipStatus: free`

The figures use Firestore server-side aggregation and do not download the user list to the browser.

## Firebase Console setup

1. Open the `shortsinshort-3a6d2` Firebase project.
2. Enable **Authentication > Sign-in method > Google**.
3. Add `shortsinshort.com` and `www.shortsinshort.com` under **Authentication > Settings > Authorized domains**.
4. Create the Firestore database if it is not already active.
5. Publish the included `firestore.rules` file in **Firestore Database > Rules**.
6. Create a new restricted web API key. Do not reuse the key previously exposed in GitHub.

## Vercel environment variables

Add every variable listed in `.env.example` to the Vercel project for Production and Preview. Values come from **Firebase project settings > Your apps > Web app**.

After adding the values, redeploy the latest commit. The profile button will then offer Google sign-in.

## Razorpay conversion tracking

At this stage, members should use the same email in their SHORTSinSHORT profile and Razorpay checkout. Accurate automatic conversion requires a verified Razorpay webhook. The webhook will set `membershipStatus` to `active` only after Razorpay confirms a paid subscription. Visitors can never set their own paid status under the included Firestore rules.
