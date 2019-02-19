package com.am.rules;

import com.am.beans.Transaction;
import com.am.utils.Configuration;
import com.am.rules.base.InvalidRuleException;
import com.am.rules.base.RulesBase;
import com.am.rules.base.RulesFactory;
import org.kie.api.runtime.KieSession;


/**
 * Controls the logic for each record
 */
public class RulesService {

    private RulesBase ruleBase;

    private Configuration configuration;

    public void execute(Transaction transaction) throws InvalidRuleException {
        configuration = Configuration.getInstance();
        ruleBase = RulesFactory.instance(configuration.get("RULES_DRL_PACKAGE"),
                Integer.parseInt(configuration.get("RULES_POOL_SIZE")),
                Boolean.parseBoolean(configuration.get("RULES_DEBUG_EXECUTION"))).getRuleBase();

        KieSession session = ruleBase.getSessionsPool().borrowKieSession();
        try {
            session.insert(transaction);
            session.fireAllRules();
        } finally {
            ruleBase.getSessionsPool().returnKieSession(session);
        }
    }
}