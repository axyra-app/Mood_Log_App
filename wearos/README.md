# Mood Log Wear OS prototype

This is a separate native Wear OS proof of concept for the first smartwatch route. It presents a manual mood check-in on the current 1–10 scale and can request one short, user-initiated heart-rate reading through Wear Health Services `MeasureClient`.

The next longitudinal iteration has a product decision to retain observations only in private on-watch storage, with no phone or cloud sync. This source still does not persist pulse or mood. Retention, encryption, export, deletion, consent copy, and local failure handling must be designed before adding that behavior; the current app is not approved for participant use.

## Scope and privacy

- On first launch, the prototype requires a local 18+ self-attestation. It is versioned and can be withdrawn from Privacy and permissions. It does not verify real age, identify an account, or replace the reviewed product-wide eligibility flow.
- Before the Android permission sheet, the prototype shows a per-reading disclosure: pulse is health data, the reading is optional, it stays on screen only, and the manual check-in remains available if the person declines.
- The watch requests the sensor permission only after the person selects **Continuar** in that disclosure.
- It checks whether the device supports heart-rate measurement before registering a callback.
- It stops after the first valid sample, after a 20-second total deadline covering sensor capability lookup and reading, on cancellation, or when the activity leaves the foreground. A synchronous or asynchronous failure to query capabilities returns the screen to a usable state.
- Every measurement attempt gets its own callback. Late sensor callbacks from a cancelled, timed-out, or previous attempt are ignored and unregistered instead of being shown as the current reading.
- If Health Services supplies multiple samples in one callback, the prototype chooses the latest valid sample by source timestamp, not by list position; non-finite and non-positive values are ignored.
- The pulse and mood values are shown only in the current screen. There is no account, phone sync, Health Connect write, Firebase, AI request, background collection, or health-value persistence.
- Before the Android permission request, the explicit response to Mood Log's disclosure is recorded locally with timestamp, scope, app version, and disclosure version. The log retains at most the latest 100 responses; the user can inspect or delete it and open the system app-permission settings. It does not record whether Android granted the runtime permission or whether the sensor returned a reading, and contains no pulse or mood value.
- Backup and device-transfer rules explicitly exclude all app storage, including the local age attestation and disclosure-response log. `allowBackup="false"` remains set as an additional control; the XML rules cover Android 12+ cloud/device transfers and Android 11 or lower backup behavior.
- The check-in rating is a self-report and starts empty; the user must tap a mood control before a score appears. The UI says that pulse does not measure emotion or provide a diagnosis and keeps the pulse value visually separate from the mood score.
- Mood controls have a 48 dp minimum touch height, and the current mood value has a descriptive screen-reader label. Validate contrast, scaling, rotary input, and real touch behavior on watch sizes before claiming accessibility support.
- The age attestation, disclosure copy, and local consent log are prototype-only and need Colombian legal/privacy review before any real-user pilot. They are not tied to a user account and cannot be exported or synced. The consent log can be erased; neither mechanism verifies age or provides evidence sufficient for a commercial pilot.
- **Build and emulator review (20 November 2026):** `:app:assembleDebug` compiles successfully with Platform 36, Build Tools 36.0.0, and Platform-tools 37.0.3. The app was installed and opened in a Wear OS 6/API 36 round emulator. After visual review, the screen now uses the Mood Log charcoal/magenta/coral/amber identity, shortens the introductory copy, and scales horizontal padding and typography from the available watch width. The content remains vertically scrollable for smaller displays. The local debug build has not been validated on a physical watch; contrast, rotary input, and sensor readings still require device review.

## Build setup

The Gradle wrapper pins Gradle 8.13 for Android Gradle Plugin 8.13.2; Java 17 or newer is required. Android Command-line Tools and the required packages are installed on the current development machine. `ANDROID_HOME`, `ANDROID_SDK_ROOT`, and user PATH entries are configured. The latest Android documentation marks `sdkmanager` deprecated in favor of `android sdk`; use that CLI to list/install packages, and use the license prompt only to review and accept licenses you agree to:

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:PATH = "$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"
$android = Join-Path $env:ANDROID_HOME "cmdline-tools\latest\bin\android.exe"
$sdkmanager = Join-Path $env:ANDROID_HOME "cmdline-tools\latest\bin\sdkmanager.bat"
& $sdkmanager --sdk_root="$env:ANDROID_HOME" --licenses
& $android sdk list --sdk="$env:ANDROID_HOME" --all
& $android sdk install --sdk="$env:ANDROID_HOME" platforms/android-36
& $android sdk install --sdk="$env:ANDROID_HOME" build-tools/36.0.0
& $android sdk install --sdk="$env:ANDROID_HOME" platform-tools
```

The `--licenses` command is interactive; accept only terms you have reviewed and agree to. The platform-tools package supplies `adb`; emulator images are optional for compilation. Then build the debug APK:

```powershell
./gradlew.bat :app:assembleDebug
```

To run on a Wear OS 4+ emulator, use Android Studio's Wear OS device manager. Health Services emulators can provide synthetic heart-rate values. A real sensor permission and reading still need validation on physical Wear OS models before compatibility can be claimed.

## Local selector check

The pure Java rule that selects the latest valid sensor sample can be checked without Android SDK packages:

```powershell
$outDir = Join-Path $env:TEMP 'moodlog-wear-core-check'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
javac -d $outDir app/src/main/java/app/moodlog/wear/HeartRateSampleSelector.java app/src/main/java/app/moodlog/wear/HeartRatePermissionSelector.java core-tests/HeartRateSampleSelectorSmokeTest.java
java -cp $outDir app.moodlog.wear.HeartRateSampleSelectorSmokeTest
```

This check covers sample selection and the API 35/36 permission boundary; it does not compile the Android activity or validate Health Services callbacks on a device.

## Platform references

- [Health Services and Wear OS](https://developer.android.com/health-and-fitness/health-services)
- [Take spot measurements with `MeasureClient`](https://developer.android.com/health-and-fitness/health-services/active-data/measure-client)
- [Permissions across Wear OS versions](https://developer.android.com/health-and-fitness/health-services/permissions)
