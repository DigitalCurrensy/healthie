# Camera permissions for the Healthie lens

The scanner is a web lens (ZXing-C++ WASM + optional `BarcodeDetector`). It needs a **secure context**, the **back camera**, and a **user tap**. Native wrappers add one more line each.

## Web / PWA (this app)

1. Serve over **HTTPS** (or `localhost`). `getUserMedia` is blocked on insecure pages.
2. If the lens sits in an iframe, the frame must allow camera:

```html
<iframe src="https://your-host/" allow="camera; fullscreen"></iframe>
```

3. Optional site-wide header:

```
Permissions-Policy: camera=(self)
```

4. The first tap on **Scan barcode** calls `getUserMedia` from that gesture. Do not wrap it in a timeout or a WASM load first — iOS drops the prompt.

5. Installed PWA (`public/manifest.webmanifest`) uses the same prompt. There is no extra camera key in the web manifest.

## iOS (Safari, WKWebView, Capacitor, React Native WebView)

Add to `Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Healthie uses the camera to read the barcode on a pack.</string>
```

For a Capacitor wrapper also set in `capacitor.config.json`:

```json
{ "plugins": { "Camera": { "presentationStyle": "fullscreen" } } }
```

If you embed the app in a `WKWebView`, set `allowsInlineMediaPlayback = true` and grant the camera permission to the web view.

## Android (Chrome, WebView, Capacitor)

`AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
<uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
```

Chrome Custom Tabs / WebView must forward the runtime permission. For Capacitor, `@capacitor/camera` is **not** required for this lens — the page uses `getUserMedia`. Still declare `CAMERA` so the WebView can prompt.

## Native ML Kit (optional later)

This build uses ZXing-C++ in a worker plus the browser `BarcodeDetector` API. If you ship a fully native iOS/Android shell, swap the worker for:

- Android: `com.google.mlkit:barcode-scanning` (formats EAN-13, EAN-8, UPC-A, UPC-E, Code 128)
- iOS: Vision `VNDetectBarcodesRequest` or ML Kit iOS

Pass the validated GTIN string into the same Healthie lookup (`/product/:barcode`). Check-digit validation lives in `src/lib/scan/gtin.ts` — keep it on every path.
