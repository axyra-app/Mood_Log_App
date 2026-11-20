package app.moodlog.wear;

/** Selects the runtime heart-rate permission for the device API level. */
final class HeartRatePermissionSelector {
    static final String LEGACY_PERMISSION = "android.permission.BODY_SENSORS";
    static final String HEALTH_PERMISSION = "android.permission.health.READ_HEART_RATE";
    static final int HEALTH_PERMISSION_API_LEVEL = 36;

    private HeartRatePermissionSelector() {}

    static String requiredForApiLevel(int apiLevel) {
        return apiLevel >= HEALTH_PERMISSION_API_LEVEL
                ? HEALTH_PERMISSION
                : LEGACY_PERMISSION;
    }
}
