package app.moodlog.wear;

import java.time.Instant;
import java.util.List;

/** Selects the newest usable heart-rate sample by its source timestamp. */
final class HeartRateSampleSelector {
    private HeartRateSampleSelector() {}

    static Sample selectLatest(List<Sample> samples) {
        if (samples == null || samples.isEmpty()) return null;

        Sample latest = null;
        for (Sample sample : samples) {
            if (sample == null || sample.timestamp == null
                    || !Double.isFinite(sample.beatsPerMinute)
                    || sample.beatsPerMinute <= 0) {
                continue;
            }
            if (latest == null || sample.timestamp.isAfter(latest.timestamp)) {
                latest = sample;
            }
        }
        return latest;
    }

    static final class Sample {
        final double beatsPerMinute;
        final Instant timestamp;

        Sample(double beatsPerMinute, Instant timestamp) {
            this.beatsPerMinute = beatsPerMinute;
            this.timestamp = timestamp;
        }
    }
}
