package app.moodlog.wear;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;

/** Dependency-free checks for the pure Java sample-selection logic. */
public final class HeartRateSampleSelectorSmokeTest {
    public static void main(String[] args) {
        Instant earlier = Instant.parse("2026-11-20T10:00:00Z");
        Instant later = Instant.parse("2026-11-20T10:00:05Z");

        HeartRateSampleSelector.Sample selected = HeartRateSampleSelector.selectLatest(
                Arrays.asList(
                        new HeartRateSampleSelector.Sample(72, later),
                        new HeartRateSampleSelector.Sample(68, earlier)));
        require(selected != null && selected.beatsPerMinute == 72
                && selected.timestamp.equals(later), "selects newest timestamp independent of order");

        require(HeartRateSampleSelector.selectLatest(Collections.emptyList()) == null,
                "empty input has no selection");
        require(HeartRateSampleSelector.selectLatest(Arrays.asList(
                new HeartRateSampleSelector.Sample(Double.NaN, later),
                new HeartRateSampleSelector.Sample(Double.POSITIVE_INFINITY, later),
                new HeartRateSampleSelector.Sample(0, later),
                new HeartRateSampleSelector.Sample(-1, later),
                new HeartRateSampleSelector.Sample(80, null))) == null,
                "ignores invalid values and missing timestamps");
        require(HeartRateSampleSelector.selectLatest(Arrays.asList(
                null,
                new HeartRateSampleSelector.Sample(64, earlier),
                new HeartRateSampleSelector.Sample(90, later)))
                .beatsPerMinute == 90, "skips null entries and returns remaining valid sample");

        require(HeartRatePermissionSelector.requiredForApiLevel(35)
                .equals(HeartRatePermissionSelector.LEGACY_PERMISSION),
                "API 35 uses the legacy body-sensor permission");
        require(HeartRatePermissionSelector.requiredForApiLevel(36)
                .equals(HeartRatePermissionSelector.HEALTH_PERMISSION),
                "API 36 uses the health heart-rate permission");
        require(HeartRatePermissionSelector.requiredForApiLevel(37)
                .equals(HeartRatePermissionSelector.HEALTH_PERMISSION),
                "later API levels keep using the health permission");

        System.out.println("Wear OS core smoke checks: 7 passed");
    }

    private static void require(boolean condition, String description) {
        if (!condition) throw new AssertionError(description);
    }
}
