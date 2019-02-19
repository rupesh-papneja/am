package com.am.rules.base;

import org.kie.api.builder.KieBuilder;
import org.kie.api.builder.KieFileSystem;
import org.kie.api.builder.Results;
import org.kie.internal.builder.IncrementalResults;
import org.kie.internal.builder.InternalKieBuilder;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This class encapsulates the knowledgebase for the Drools 7 rules engine.
 * It is a composite class that has rules container and rules sessions pool.
 * It provides a method to add the rule to the knowledge base.
 */

public final class RulesBase {

    /**
     * Logger for the class
     */
    private static final Logger log = Logger.getLogger(RulesBase.class.getName());

    private final String packageName;
    private final int poolSize;
    private final String baseVersion = "1.0.";
    private boolean debugKie;
    private int versionNumber = 0;

    private String version;

    private RulesContainer containerComponent;
    private RulesSessionsPool sessionsPool;


    protected RulesBase(String packageName, int poolSize, boolean debugKie) {
        this.packageName = packageName;
        this.poolSize = poolSize;
        this.debugKie = debugKie;

        this.version = baseVersion + (versionNumber++);

        this.containerComponent = new RulesContainer(packageName, version, debugKie);
        this.sessionsPool = new RulesSessionsPool(containerComponent, poolSize);
    }

    /**
     * Adds DRL rule to the Kie runtime
     *
     * @param rule     : drl rule string
     * @param uniqueId : unique identifer for the rule
     * @throws InvalidRuleException
     */
    protected final synchronized void addRules(String rule, String uniqueId) throws InvalidRuleException {
        log.log(Level.FINE, "Adding the rule {0} ", rule);
        String path = containerComponent.getPackageStructure() + uniqueId + ".drl";
        KieFileSystem kfs = containerComponent.getKieFileSystem();
        KieBuilder kieBuilder = containerComponent.getKieBuilder();
        kfs.write(path, rule);
        IncrementalResults results = ((InternalKieBuilder) kieBuilder).incrementalBuild();
        if (results.getAddedMessages().size() > 0) {
            kfs.delete(path);
            throw new InvalidRuleException("Error in evaluating rule for kiebase:" + rule);
        }
        Results updateResults = containerComponent.getKieContainer().updateToVersion(containerComponent.getReleaseId());
        if (updateResults.getMessages().size() > 0) {
            throw new InvalidRuleException("Error in evaluating rule for kiecontainer:" + rule);
        }

    }

    /**
     * Returns RulesSessionsPool for the knowledgebase.
     *
     * @return RulesSessionPool
     */
    public RulesSessionsPool getSessionsPool() {
        return sessionsPool;
    }
}