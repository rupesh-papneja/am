package com.am.rules.base;

import org.junit.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Test for RulesFactory
 */
public class RulesFactoryTest {

    @Test
    public void testInvalidRulesExecution() {

        RulesBase rulesBase = RulesFactory.instance("com.am.rules.definitions", 10, true).getRuleBase();
        assertNotNull(rulesBase);
        String rule = "Invalid DRL";
        assertThrows(InvalidRuleException.class, ()-> rulesBase.addRules(rule, UUID.randomUUID().toString()));
    }
}
