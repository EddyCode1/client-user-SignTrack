const appJson = require('./app.json');

const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

/** @type {import('expo/config').ExpoConfig} */
module.exports = () => ({
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      ...(apiKey ? {
        config: {
          googleMaps: { apiKey },
        },
      } : {}),
    },
  },
});
