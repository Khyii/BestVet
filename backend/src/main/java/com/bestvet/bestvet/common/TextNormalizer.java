package com.bestvet.bestvet.common;

import java.text.Normalizer;
import java.util.Locale;

/** Comparación de texto sin distinguir mayúsculas ni tildes (RF6). */
public final class TextNormalizer {
    private TextNormalizer() {}

    public static String normalize(String text) {
        if (text == null) {
            return "";
        }
        return Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }

    /** true si el criterio está vacío o si el texto lo contiene. */
    public static boolean containsIgnoringCaseAndAccents(String text, String criterion) {
        String c = normalize(criterion);
        return c.isEmpty() || normalize(text).contains(c);
    }
}
