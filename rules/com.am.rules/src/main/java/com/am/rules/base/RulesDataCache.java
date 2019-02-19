package com.am.rules.base;

import java.util.HashMap;
import java.util.Map;

/**
 * A rules data cache used to maintain the list of already added rules
 */

public final class RulesDataCache {

    private final Map<String, String> rules;

    protected RulesDataCache() {
        rules = new HashMap<>();
    }

    /**
     * Returns the set of rules added
     *
     * @return
     */
    protected final Map<String, String> getRules() {
        return rules;
    }

    protected final void setRule(String filename, String rule) {
        rules.put(filename, rule);
    }

    /**
     * Clears the cache
     */
    @Override
    public void finalize() {
        rules.clear();
    }

}
