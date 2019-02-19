package com.am.rules.base;

import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * The class initializes the rules Knowlegebase
 */
public final class RulesFactory {
    /**
     * Logger for the class
     */
    private static final Logger log = Logger.getLogger(RulesFactory.class.getName());

    /**
     * singleton object instance
     */

    private static RulesFactory instance;

    private RulesDataCache rulesDataCache;

    private RulesBase rulesBase;
    private RulesProcessor rulesProcessor;

    private RulesFactory(String DRLPackageName, int poolSize, boolean debugExecution) {
        rulesDataCache = new RulesDataCache();
        rulesBase = new RulesBase("com.am.rules.engine",
                poolSize,
                debugExecution);
        rulesProcessor = new RulesProcessor(DRLPackageName, rulesDataCache);
    }

    /**
     * Returns singleton instance
     *
     * @return RulesFactory
     * @throws InvalidRuleException
     */
    public final static RulesFactory instance(String DRLPackageName, Integer poolSize, boolean debugExecution) throws InvalidRuleException {
        if (null == instance) {
            instance = new RulesFactory(DRLPackageName, poolSize, debugExecution);
            instance.init();
        }
        return instance;
    }

    /**
     * Called once the bean is initialized by responsible for setting the initial rules cache
     * for the rules engine
     */
    public void init() throws InvalidRuleException {
        rulesProcessor.fetchRules();
        rulesDataCache.getRules().forEach((k, v) -> {
            try {
                String key = UUID.randomUUID().toString();
                rulesBase.addRules(v, key);
            } catch (InvalidRuleException e) {
                log.log(Level.SEVERE, "Ignoring Invalid rule " + k, e);
            }
        });
    }

    public RulesBase getRuleBase() {
        return rulesBase;
    }

}