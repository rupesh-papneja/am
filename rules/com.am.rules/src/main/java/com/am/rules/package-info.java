/**
 * This package contains the classes that implement the Rules Engine for the application.
 * The Rules Engine is based on Drools 7 which renamed its modules as KIE.
 * There is a single knowledge base which act as container for all rules.
 *
 * Each DRL is individually compiled, saved and deleted. It is done to make sure that no invalid DRL is added to
 * Kie runtime as it invalidates the Kie base and then no rules fire.
 *
 * The DRL files are present under /resources/com/am/rules/definitions
 *
 * Implementation Details:
 *
 * 1. RuleFactory is responsible to initial RulesBase with all the rules required for the application.
 * 2. RulesProcessor reads the drl from the given package location.
 * 3. RulesDataCache is the in memory cache of all the drl files
 * 4. RuleContainer is the container for Rules, its is in memory container of the kie knowledgebase
 * 5. RuleSessionsPool is the basic implementation of object pool.
 *
 * @author rupesh papneja
 * @since 1.0.3
 */
package com.am.rules;