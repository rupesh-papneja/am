package com.am.utils;

import org.junit.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Test class for Configuration utils class
 */

public class ConfigurationTest {

    Configuration config = Configuration.getInstance();

    @Test
    public void testConfig() {
        assertEquals(config.get("LOG_LEVEL"), "INFO");
        assertEquals(config.get("RULES_DEBUG_EXECUTION"), "true");
        assertEquals(config.get("RULES_POOL_SIZE"), "10");
    }
}
