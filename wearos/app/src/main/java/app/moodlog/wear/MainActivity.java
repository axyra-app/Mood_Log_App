package app.moodlog.wear;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.graphics.drawable.RippleDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.view.Gravity;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.health.services.client.HealthServices;
import androidx.health.services.client.MeasureClient;
import androidx.health.services.client.data.Availability;
import androidx.health.services.client.data.DataPointContainer;
import androidx.health.services.client.data.DataType;
import androidx.health.services.client.data.DeltaDataType;
import androidx.health.services.client.data.MeasureCapabilities;
import androidx.health.services.client.data.SampleDataPoint;

import com.google.common.util.concurrent.ListenableFuture;
import androidx.health.services.client.MeasureCallback;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executor;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Wear OS sensor proof of concept. Values remain in view memory and are not synced or persisted.
 */
public final class MainActivity extends Activity {
    private static final int REQUEST_HEART_RATE_PERMISSION = 4101;
    private static final long MEASUREMENT_TIMEOUT_MS = 20_000L;
    private static final int MAX_CONSENT_HISTORY_EVENTS = 100;
    private static final String CONSENT_PREFS = "mood_log_sensor_consent_v1";
    private static final String CONSENT_EVENTS_KEY = "events";
    private static final String SENSOR_CONSENT_VERSION = "co-wear-spot-hr-draft-v1";
    private static final String ADULT_ELIGIBILITY_KEY = "adult_eligibility";
    private static final String ADULT_ELIGIBILITY_VERSION = "co-18plus-wear-draft-v1";
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter
            .ofPattern("HH:mm")
            .withZone(ZoneId.systemDefault());

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Executor mainExecutor = command -> handler.post(command);
    private final Runnable timeoutRunnable = this::finishWithoutReading;

    private MeasureClient measureClient;
    private boolean callbackRegistered;
    private boolean measurementPending;
    private boolean activityResumed;
    private boolean waitingForPermission;
    private int measurementAttempt;
    private int moodScore;
    private MeasureCallback activeMeasureCallback;
    private TextView moodValue;
    private TextView heartRateValue;
    private TextView statusText;
    private Button measureButton;

    private MeasureCallback createMeasureCallback(int attempt) {
        return new MeasureCallback() {
            @Override
            public void onAvailabilityChanged(DeltaDataType<?, ?> dataType, Availability availability) {
                runOnUiThread(() -> {
                    if (isActiveMeasurement(attempt, this)
                            && (measurementPending || callbackRegistered)) {
                        statusText.setText("Sensor: " + availability);
                    }
                });
            }

            @Override
            public void onDataReceived(DataPointContainer data) {
                if (!isActiveMeasurement(attempt, this)) return;
                List<SampleDataPoint<Double>> samples = data.getData(DataType.HEART_RATE_BPM);
                if (samples == null || samples.isEmpty()) return;

                long bootInstantMillis = System.currentTimeMillis() - SystemClock.elapsedRealtime();
                Instant bootInstant = Instant.ofEpochMilli(bootInstantMillis);
                List<HeartRateSampleSelector.Sample> candidates = new ArrayList<>();
                for (SampleDataPoint<Double> sample : samples) {
                    candidates.add(new HeartRateSampleSelector.Sample(
                            sample.getValue(), sample.getTimeInstant(bootInstant)));
                }
                HeartRateSampleSelector.Sample latest =
                        HeartRateSampleSelector.selectLatest(candidates);
                if (latest == null) return;

                long bpm = Math.round(latest.beatsPerMinute);
                Instant sampleTime = latest.timestamp;
                runOnUiThread(() -> showReading(attempt, bpm, sampleTime));
            }

            @Override
            public void onRegistered() {
                if (!isActiveMeasurement(attempt, this)) {
                    if (activeMeasureCallback == this) {
                        activeMeasureCallback = null;
                        callbackRegistered = false;
                    }
                    try {
                        measureClient.unregisterMeasureCallbackAsync(
                                DataType.HEART_RATE_BPM,
                                this);
                    } catch (RuntimeException ignored) {
                        // A late registration after cancellation must not keep sampling.
                    }
                    return;
                }
                callbackRegistered = true;
                runOnUiThread(() -> {
                    if (isActiveMeasurement(attempt, this)) {
                        statusText.setText("Midiendo; límite total de 20 s…");
                    }
                });
            }

            @Override
            public void onRegistrationFailed(Throwable throwable) {
                if (!isActiveMeasurement(attempt, this)) return;
                callbackRegistered = false;
                activeMeasureCallback = null;
                measurementPending = false;
                runOnUiThread(() -> {
                    if (!activityResumed || attempt != measurementAttempt) return;
                    handler.removeCallbacks(timeoutRunnable);
                    measureButton.setEnabled(true);
                    measureButton.setText("Medir pulso");
                    statusText.setText("El reloj no pudo iniciar la lectura. Revisa permiso y sensor.");
                });
            }
        };
    }

    private boolean isActiveMeasurement(int attempt, MeasureCallback callback) {
        return activityResumed
                && attempt == measurementAttempt
                && activeMeasureCallback == callback;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        measureClient = HealthServices.getClient(this).getMeasureClient();
        render();
        statusText.setText("Check-in de prueba. Pulso y ánimo no se guardan ni sincronizan.");
        enforceAdultEligibility();
    }

    @Override
    protected void onPause() {
        boolean wasMeasuring = measurementPending || callbackRegistered;
        activityResumed = false;
        stopMeasurement();
        if (wasMeasuring && measureButton != null) {
            measureButton.setEnabled(true);
            measureButton.setText("Medir pulso");
            statusText.setText("Lectura detenida al salir de esta pantalla.");
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        activityResumed = true;
    }

    @Override
    protected void onDestroy() {
        stopMeasurement();
        super.onDestroy();
    }

    @Override
    public void onRequestPermissionsResult(
            int requestCode,
            String[] permissions,
            int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != REQUEST_HEART_RATE_PERMISSION || !waitingForPermission) return;

        waitingForPermission = false;
        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            beginMeasurement();
        } else {
            statusText.setText("Permiso no concedido. El check-in manual sigue disponible.");
            measureButton.setEnabled(true);
            measureButton.setText("Medir pulso");
        }
    }

    private void render() {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setVerticalScrollBarEnabled(false);
        scroll.setBackgroundColor(Color.rgb(16, 20, 20));

        int widthDp = getResources().getConfiguration().screenWidthDp;
        if (widthDp <= 0) {
            widthDp = Math.round(getResources().getDisplayMetrics().widthPixels
                    / getResources().getDisplayMetrics().density);
        }
        float scale = Math.max(0.86f, Math.min(1.14f, widthDp / 192f));
        int horizontalPaddingDp = Math.max(14, Math.min(28, Math.round(widthDp * 0.115f)));

        FrameLayout viewport = new FrameLayout(this);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER_HORIZONTAL);
        root.setPadding(dp(horizontalPaddingDp), dp(12), dp(horizontalPaddingDp), dp(16));
        root.setBackgroundColor(Color.rgb(16, 20, 20));

        TextView title = text("Mood Log", Math.round(21 * scale), Color.WHITE, true);
        title.setGravity(Gravity.CENTER);
        root.addView(title, matchWrap());

        TextView explanation = text(
                "Un registro breve de tu día.",
                Math.round(12 * scale),
                Color.rgb(226, 222, 218),
                false);
        explanation.setGravity(Gravity.CENTER);
        addSpaced(root, explanation, 4);

        TextView disclaimer = text(
                "El pulso es independiente de tu ánimo.",
                Math.round(11 * scale),
                Color.rgb(194, 196, 189),
                false);
        disclaimer.setGravity(Gravity.CENTER);
        addSpaced(root, disclaimer, 4);

        TextView moodLabel = text("¿Cómo te sientes?", Math.round(15 * scale), Color.WHITE, true);
        moodLabel.setGravity(Gravity.CENTER);
        addSpaced(root, moodLabel, 9);

        LinearLayout moodRow = new LinearLayout(this);
        moodRow.setGravity(Gravity.CENTER);
        Button decrease = button("−", false);
        decrease.setContentDescription("Disminuir ánimo");
        decrease.setOnClickListener(view -> setMoodScore(moodScore - 1));
        moodValue = text("—", Math.round(25 * scale), Color.rgb(255, 184, 63), true);
        moodValue.setGravity(Gravity.CENTER);
        moodValue.setContentDescription(
                "Estado de ánimo aún no autoinformado. Elige un valor de 1 a 10.");
        Button increase = button("+", false);
        increase.setContentDescription("Aumentar ánimo");
        increase.setOnClickListener(view -> setMoodScore(moodScore + 1));
        moodRow.addView(decrease, weightedButton());
        moodRow.addView(moodValue, weightedValue());
        moodRow.addView(increase, weightedButton());
        addSpaced(root, moodRow, 4);

        TextView scaleLabel = text("Tu ánimo, del 1 al 10", Math.round(10 * scale), Color.rgb(194, 196, 189), false);
        scaleLabel.setGravity(Gravity.CENTER);
        addSpaced(root, scaleLabel, 3);

        measureButton = button("Medir pulso", true);
        measureButton.setOnClickListener(view -> onMeasurePressed());
        addSpaced(root, measureButton, 10);

        heartRateValue = text("Sin lectura", Math.round(18 * scale), Color.WHITE, true);
        heartRateValue.setGravity(Gravity.CENTER);
        addSpaced(root, heartRateValue, 3);

        statusText = text("", Math.round(10 * scale), Color.rgb(194, 196, 189), false);
        statusText.setGravity(Gravity.CENTER);
        addSpaced(root, statusText, 5);

        TextView localOnly = text(
                "El pulso no mide una emoción ni ofrece un diagnóstico.",
                Math.round(10 * scale),
                Color.rgb(166, 173, 166),
                false);
        localOnly.setGravity(Gravity.CENTER);
        addSpaced(root, localOnly, 6);

        Button privacyButton = button("Privacidad y permisos", false);
        privacyButton.setOnClickListener(view -> showPrivacyControls());
        addSpaced(root, privacyButton, 6);

        int contentWidthDp = Math.min(widthDp, 420);
        FrameLayout.LayoutParams contentParams = new FrameLayout.LayoutParams(
                dp(contentWidthDp),
                FrameLayout.LayoutParams.WRAP_CONTENT,
                Gravity.TOP | Gravity.CENTER_HORIZONTAL);
        viewport.addView(root, contentParams);
        scroll.addView(viewport, new ScrollView.LayoutParams(
                ScrollView.LayoutParams.MATCH_PARENT,
                ScrollView.LayoutParams.WRAP_CONTENT));
        setContentView(scroll);
    }

    private void onMeasurePressed() {
        if (measurementPending || callbackRegistered) {
            stopMeasurement();
            measureButton.setText("Medir pulso");
            measureButton.setEnabled(true);
            statusText.setText("Lectura cancelada.");
            return;
        }

        new AlertDialog.Builder(this)
                .setTitle("Lectura puntual de pulso")
                .setMessage("El pulso es un dato de salud. Si continúas, el reloj intentará una lectura para mostrarla solo en esta pantalla; no se guarda ni se envía. Medirlo es opcional: puedes usar el check-in manual sin dar este permiso. El pulso no mide emociones ni ofrece un diagnóstico.")
                .setNegativeButton("Ahora no", (dialog, which) -> {
                    recordConsent("declined");
                    statusText.setText("Lectura opcional no iniciada. El check-in manual sigue disponible.");
                    measureButton.setEnabled(true);
                    measureButton.setText("Medir pulso");
                })
                .setPositiveButton("Continuar", (dialog, which) -> {
                    if (!recordConsent("accepted")) {
                        statusText.setText("No se pudo guardar tu respuesta al aviso. La lectura no se iniciará.");
                        measureButton.setEnabled(true);
                        measureButton.setText("Medir pulso");
                        return;
                    }
                    requestPermissionOrMeasure();
                })
                .show();
    }

    private boolean recordConsent(String decision) {
        try {
            android.content.SharedPreferences preferences = getSharedPreferences(
                    CONSENT_PREFS,
                    MODE_PRIVATE);
            JSONArray events = new JSONArray(preferences.getString(CONSENT_EVENTS_KEY, "[]"));
            JSONObject event = new JSONObject();
            event.put("schemaVersion", 1);
            event.put("consentVersion", SENSOR_CONSENT_VERSION);
            event.put("scope", "single_heart_rate_reading_displayed_on_screen");
            event.put("decision", decision);
            event.put("recordedAt", Instant.now().toString());
            event.put("appVersion", BuildConfig.VERSION_NAME);
            JSONArray retainedEvents = new JSONArray();
            int firstRetainedIndex = Math.max(0, events.length() - MAX_CONSENT_HISTORY_EVENTS + 1);
            for (int index = firstRetainedIndex; index < events.length(); index++) {
                retainedEvents.put(events.get(index));
            }
            retainedEvents.put(event);
            return preferences.edit().putString(CONSENT_EVENTS_KEY, retainedEvents.toString()).commit();
        } catch (JSONException | RuntimeException exception) {
            return false;
        }
    }

    private void showPrivacyControls() {
        String message = adultEligibilitySummary()
                + "\n\n"
                + consentHistorySummary()
                + "\n\nEl pulso y el ánimo no se guardan. Este historial conserva como máximo las últimas 100 respuestas al aviso de Mood Log; no indica si Android concedió el permiso ni si el sensor entregó una lectura. Está solo en este reloj, no identifica una cuenta, no se sincroniza y puede perderse si se borran los datos de la app o se desinstala. No es un registro legal suficiente para un piloto."
                + "\n\nPuedes borrar el historial del aviso, retirar la autodeclaración 18+ o revisar/revocar el permiso del sensor en los ajustes del reloj.";

        new AlertDialog.Builder(this)
                .setTitle("Privacidad y permisos")
                .setMessage(message)
                .setItems(new String[]{
                        "Abrir permisos del sensor",
                        "Retirar confirmación 18+ y salir",
                        "Borrar historial del aviso",
                        "Cerrar",
                }, (dialog, which) -> {
                    if (which == 0) openAppPermissions();
                    else if (which == 1) confirmAdultEligibilityRevocation();
                    else if (which == 2) confirmConsentLogDeletion();
                })
                .show();
    }

    private void enforceAdultEligibility() {
        android.content.SharedPreferences preferences = getSharedPreferences(CONSENT_PREFS, MODE_PRIVATE);
        try {
            JSONObject eligibility = new JSONObject(preferences.getString(ADULT_ELIGIBILITY_KEY, "{}"));
            if (eligibility.getBoolean("isAdult")
                    && ADULT_ELIGIBILITY_VERSION.equals(eligibility.getString("version"))
                    && !eligibility.getString("attestedAt").isEmpty()) {
                return;
            }
        } catch (JSONException | RuntimeException ignored) {
            // Missing or unreadable eligibility is treated as not confirmed.
        }

        new AlertDialog.Builder(this)
                .setTitle("Antes de comenzar")
                .setMessage("Este prototipo está dirigido a personas de 18 años o más. Confirma tu edad para continuar. Esta declaración local no verifica tu edad real y no debes usar el prototipo si eres menor.")
                .setCancelable(false)
                .setNegativeButton("Salir", (dialog, which) -> finish())
                .setPositiveButton("Tengo 18 años o más", (dialog, which) -> {
                    if (!recordAdultEligibility()) {
                        Toast.makeText(this, "No se pudo guardar la confirmación local. El prototipo se cerrará.", Toast.LENGTH_LONG).show();
                        finish();
                    }
                })
                .show();
    }

    private boolean recordAdultEligibility() {
        try {
            JSONObject eligibility = new JSONObject();
            eligibility.put("isAdult", true);
            eligibility.put("version", ADULT_ELIGIBILITY_VERSION);
            eligibility.put("attestedAt", Instant.now().toString());
            eligibility.put("appVersion", BuildConfig.VERSION_NAME);
            return getSharedPreferences(CONSENT_PREFS, MODE_PRIVATE)
                    .edit()
                    .putString(ADULT_ELIGIBILITY_KEY, eligibility.toString())
                    .commit();
        } catch (JSONException | RuntimeException exception) {
            return false;
        }
    }

    private String adultEligibilitySummary() {
        try {
            JSONObject eligibility = new JSONObject(getSharedPreferences(CONSENT_PREFS, MODE_PRIVATE)
                    .getString(ADULT_ELIGIBILITY_KEY, "{}"));
            if (!eligibility.getBoolean("isAdult")
                    || !ADULT_ELIGIBILITY_VERSION.equals(eligibility.getString("version"))) {
                return "No hay una confirmación 18+ vigente.";
            }
            return "Autodeclaración 18+ vigente desde " + eligibility.getString("attestedAt")
                    + ". No verifica la edad real.";
        } catch (JSONException | RuntimeException exception) {
            return "No hay una confirmación 18+ vigente.";
        }
    }

    private void confirmAdultEligibilityRevocation() {
        new AlertDialog.Builder(this)
                .setTitle("Retirar confirmación 18+")
                .setMessage("Se borrará la autodeclaración local y se cerrará el prototipo. Tendrás que confirmar de nuevo para volver a entrar.")
                .setNegativeButton("Cancelar", null)
                .setPositiveButton("Retirar y salir", (dialog, which) -> {
                    boolean removed = getSharedPreferences(CONSENT_PREFS, MODE_PRIVATE)
                            .edit()
                            .remove(ADULT_ELIGIBILITY_KEY)
                            .commit();
                    if (removed) finishAndRemoveTask();
                    else Toast.makeText(this, "No se pudo retirar la confirmación.", Toast.LENGTH_LONG).show();
                })
                .show();
    }

    private String consentHistorySummary() {
        try {
            JSONArray events = new JSONArray(getSharedPreferences(CONSENT_PREFS, MODE_PRIVATE)
                    .getString(CONSENT_EVENTS_KEY, "[]"));
            if (events.length() == 0) return "No hay respuestas al aviso de Mood Log registradas.";

            StringBuilder summary = new StringBuilder("Respuestas al aviso de Mood Log (más reciente primero):");
            int first = Math.max(0, events.length() - 5);
            for (int i = events.length() - 1; i >= first; i--) {
                JSONObject event = events.getJSONObject(i);
                String decision = event.optString("decision", "");
                String label = "accepted".equals(decision)
                        ? "Aceptaste el aviso"
                        : "declined".equals(decision)
                                ? "Rechazaste el aviso"
                                : "Respuesta desconocida";
                summary.append("\n• ")
                        .append(label)
                        .append(" · ")
                        .append(event.optString("recordedAt", "hora no disponible"));
            }
            return summary.toString();
        } catch (JSONException | RuntimeException exception) {
            return "No fue posible leer el registro local de permisos.";
        }
    }

    private void confirmConsentLogDeletion() {
        new AlertDialog.Builder(this)
                .setTitle("Borrar historial del aviso")
                .setMessage("Esto elimina del reloj las respuestas guardadas al aviso de Mood Log. No cambia el permiso del sensor de Android.")
                .setNegativeButton("Cancelar", null)
                .setPositiveButton("Borrar", (dialog, which) -> {
                    boolean deleted = getSharedPreferences(CONSENT_PREFS, MODE_PRIVATE)
                            .edit()
                            .remove(CONSENT_EVENTS_KEY)
                            .commit();
                    Toast.makeText(
                            this,
                            deleted ? "Registro local borrado." : "No se pudo borrar el registro.",
                            Toast.LENGTH_SHORT).show();
                })
                .show();
    }

    private void openAppPermissions() {
        Intent intent = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(Uri.fromParts("package", getPackageName(), null));
        try {
            startActivity(intent);
        } catch (RuntimeException exception) {
            Toast.makeText(this, "Abre los ajustes del reloj para administrar el permiso de sensores.", Toast.LENGTH_LONG).show();
        }
    }

    private void requestPermissionOrMeasure() {
        String permission = requiredHeartRatePermission();
        if (checkSelfPermission(permission) != PackageManager.PERMISSION_GRANTED) {
            waitingForPermission = true;
            statusText.setText("Se pedirá permiso solo para esta lectura.");
            requestPermissions(new String[]{permission}, REQUEST_HEART_RATE_PERMISSION);
            return;
        }
        beginMeasurement();
    }

    private String requiredHeartRatePermission() {
        return HeartRatePermissionSelector.requiredForApiLevel(
                android.os.Build.VERSION.SDK_INT);
    }

    private void beginMeasurement() {
        int attempt = ++measurementAttempt;
        measurementPending = true;
        measureButton.setEnabled(false);
        measureButton.setText("Preparando sensor…");
        heartRateValue.setText("Esperando sensor…");
        statusText.setText("Mantén el reloj ajustado a la muñeca.");
        // Bound the entire operation, including the asynchronous capability lookup.
        // Otherwise a stalled Health Services future can leave the UI pending forever.
        handler.removeCallbacks(timeoutRunnable);
        handler.postDelayed(timeoutRunnable, MEASUREMENT_TIMEOUT_MS);

        ListenableFuture<MeasureCapabilities> capabilitiesFuture;
        try {
            capabilitiesFuture = measureClient.getCapabilitiesAsync();
        } catch (RuntimeException exception) {
            stopMeasurement();
            measureButton.setEnabled(true);
            measureButton.setText("Medir pulso");
            statusText.setText("No fue posible consultar el sensor en este momento.");
            return;
        }
        capabilitiesFuture.addListener(() -> {
            if (!activityResumed || attempt != measurementAttempt) return;
            try {
                MeasureCapabilities capabilities = capabilitiesFuture.get();
                measurementPending = false;
                if (!capabilities.getSupportedDataTypesMeasure().contains(DataType.HEART_RATE_BPM)) {
                    handler.removeCallbacks(timeoutRunnable);
                    runOnUiThread(() -> {
                        measureButton.setEnabled(true);
                        measureButton.setText("Medir pulso");
                        statusText.setText("Este reloj no ofrece lectura puntual de pulso.");
                    });
                    return;
                }

                MeasureCallback callback = createMeasureCallback(attempt);
                activeMeasureCallback = callback;
                callbackRegistered = true;
                measureClient.registerMeasureCallback(
                        DataType.HEART_RATE_BPM,
                        mainExecutor,
                        callback);
            } catch (Exception exception) {
                measurementPending = false;
                callbackRegistered = false;
                if (attempt == measurementAttempt) activeMeasureCallback = null;
                handler.removeCallbacks(timeoutRunnable);
                runOnUiThread(() -> {
                    if (!activityResumed || attempt != measurementAttempt) return;
                    measureButton.setEnabled(true);
                    measureButton.setText("Medir pulso");
                    statusText.setText("No fue posible consultar el sensor en este momento.");
                });
            }
        }, mainExecutor);
    }

    private void showReading(int attempt, long bpm, Instant sampleTime) {
        if (!callbackRegistered || !activityResumed || attempt != measurementAttempt) return;
        heartRateValue.setText(bpm + " lpm");
        statusText.setText("Lectura " + TIME_FORMAT.format(sampleTime)
                + " · pulso y ánimo se mantienen independientes");
        stopMeasurement();
        measureButton.setEnabled(true);
        measureButton.setText("Medir de nuevo");
    }

    private void finishWithoutReading() {
        stopMeasurement();
        measureButton.setEnabled(true);
        measureButton.setText("Intentar de nuevo");
        statusText.setText("No llegó una lectura. El check-in manual sigue disponible.");
    }

    private void stopMeasurement() {
        measurementAttempt++;
        measurementPending = false;
        handler.removeCallbacks(timeoutRunnable);
        MeasureCallback callback = activeMeasureCallback;
        activeMeasureCallback = null;
        if (callback != null && measureClient != null) {
            try {
                measureClient.unregisterMeasureCallbackAsync(
                        DataType.HEART_RATE_BPM,
                        callback);
            } catch (RuntimeException ignored) {
                // The user-facing state remains local; unregister is best-effort on lifecycle exit.
            }
        }
        callbackRegistered = false;
    }

    private void setMoodScore(int score) {
        moodScore = Math.max(1, Math.min(10, score));
        moodValue.setText(String.valueOf(moodScore));
        moodValue.setContentDescription("Estado de ánimo autoinformado: " + moodScore + " de 10.");
    }

    private TextView text(String value, int sp, int color, boolean bold) {
        TextView view = new TextView(this);
        view.setText(value);
        view.setTextSize(sp);
        view.setTextColor(color);
        if (bold) view.setTypeface(null, android.graphics.Typeface.BOLD);
        view.setLineSpacing(dp(2), 1f);
        return view;
    }

    private Button button(String label, boolean primary) {
        Button view = new Button(this);
        view.setText(label);
        view.setTextColor(primary ? Color.rgb(16, 20, 20) : Color.rgb(246, 243, 237));
        view.setAllCaps(false);
        view.setMinHeight(dp(48));
        view.setPadding(dp(10), dp(4), dp(10), dp(4));
        GradientDrawable background = primary
                ? new GradientDrawable(
                        GradientDrawable.Orientation.TL_BR,
                        new int[]{Color.rgb(214, 94, 232), Color.rgb(255, 123, 156), Color.rgb(255, 184, 63)})
                : new GradientDrawable();
        if (!primary) {
            background.setColor(Color.rgb(34, 40, 37));
            background.setStroke(dp(1), Color.rgb(64, 73, 67));
        }
        background.setCornerRadius(dp(48));
        view.setBackground(new RippleDrawable(
                ColorStateList.valueOf(Color.argb(46, 255, 255, 255)),
                background,
                null));
        return view;
    }

    private void addSpaced(LinearLayout parent, View child, int topDp) {
        LinearLayout.LayoutParams params = matchWrap();
        params.topMargin = dp(topDp);
        parent.addView(child, params);
    }

    private LinearLayout.LayoutParams matchWrap() {
        return new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
    }

    private LinearLayout.LayoutParams weightedButton() {
        return new LinearLayout.LayoutParams(0, dp(48), 1f);
    }

    private LinearLayout.LayoutParams weightedValue() {
        return new LinearLayout.LayoutParams(0, dp(48), 1f);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
