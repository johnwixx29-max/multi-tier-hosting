# Mobile app (Expo / React Native)
## One-time setup
1. Install Node.js LTS (nodejs.org) and the **Expo Go** app on your phone.
2. Create a fresh Expo project, then copy these files over it:
       npx create-expo-app@latest bizapp --template blank
       (copy App.js and the src/ folder from here into bizapp/, replacing App.js)
3. Edit `src/config.js` -> set API_BASE to your backend address.
## Run
       cd bizapp
       npx expo start
   Scan the QR code with Expo Go (phone and PC on the same Wi-Fi).
## Screens
Products (pull down to refresh) | Inquiry form | Status (tap Ping to see which server answers)
## Notes
- Uses only built-in React Native components, so no extra npm packages are needed.
- Plain http:// works in Expo Go for testing. For a published app, put HTTPS on the load balancer.
