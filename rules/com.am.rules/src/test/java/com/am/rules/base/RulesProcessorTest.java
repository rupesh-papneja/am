package com.am.rules.base;

import org.junit.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Test for RulesProcessor
 */
public class RulesProcessorTest {

    @Test
    public void testFetchRule() {
        RulesDataCache rulesDataCache = new RulesDataCache();
        new RulesProcessor("com.am.rules.definitions", rulesDataCache).fetchRules();
        assertEquals(1, rulesDataCache.getRules().size());
        assertThrows(InvalidRuleException.class, ()-> new RulesProcessor("com.invalid.package", rulesDataCache).fetchRules());
    }
}
