# TriggerForm — Setup Guide

## Fișiere de copiat în proiectul tău Expo

```
src/
  utils/colors.ts
  types/index.ts
  data/index.ts
  store/useAppStore.ts
  components/
    UI/index.tsx
    BodyMap/index.tsx

app/
  _layout.tsx               ← înlocuiește cel existent
  (tabs)/
    _layout.tsx             ← înlocuiește cel existent
    index.tsx               ← Home Screen
    scan.tsx                ← Scanner Screen
    exercises.tsx           ← Exercises Screen
    profile.tsx             ← Profile Screen
  exercise/
    [id].tsx                ← Exercise Detail
```

## Instalare dependențe noi

```bash
npx expo install react-native-svg
npx expo install zustand
npx expo install @react-native-community/slider
npx expo install expo-camera
npx expo install expo-haptics
```

## Pornire

```bash
npx expo start
```

## Note importante

- **BodySVG** folosește `react-native-svg` — nu HTML SVG
- **Slider** vine din `@react-native-community/slider`, nu din React Native core (deprecated)
- **Camera** folosește `expo-camera` SDK 52 cu noul API `CameraView`
- **Zustand store** e global — `selectedRegion` și `painLevel` se sincronizează între ecrane
