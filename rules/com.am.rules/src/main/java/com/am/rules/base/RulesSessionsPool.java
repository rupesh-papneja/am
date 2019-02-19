package com.am.rules.base;

import org.kie.api.event.rule.DebugAgendaEventListener;
import org.kie.api.event.rule.DebugRuleRuntimeEventListener;
import org.kie.api.runtime.KieSession;

import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Logger;

/**
 * This class provides the object pool implementation for Rules session objects, which are expensive to create at
 * runtime.
 */
public final class RulesSessionsPool {
    /**
     * Logger for the class
     */
    private static final Logger log = Logger.getLogger(RulesSessionsPool.class.getName());
    /**
     * Elements used for session pool
     * One of the main consideration for the pool is to refresh itself, which means that any time a request comes in
     * during the refreshing the pool, it should not hang the thread waiting for resource to be created in the pool
     * ConcurrentLinkedQueue acts as an empty queue and does not wait to have an element present which is useful
     * feature during refresh
     */
    private final ConcurrentLinkedQueue<KieSession> sessions;
    private final int poolsize;
    private final AtomicInteger current;


    /**
     * Used to refresh the pool in case there is a delete as it invalidates the existing sessions in the pool
     */
    private AtomicBoolean shutdown;


    private RulesContainer container;

    /**
     * Constructor, values passed using bean definition in application context xml
     *
     * @param poolsize : pool size for KieSessions
     */
    protected RulesSessionsPool(RulesContainer container, int poolsize) {
        //initializing the final values
        this.container = container;

        this.poolsize = poolsize;
        this.current = new AtomicInteger(0);

        //initializing the pool for Kie sessions
        sessions = new ConcurrentLinkedQueue<>();
        shutdown = new AtomicBoolean(false);

        while (current.intValue() < poolsize) {
            sessions.add(createKieSessions());
            current.incrementAndGet();
        }
    }

    /**
     * Creates and returns new KieSession for rule execution
     *
     * @return KieSession
     */
    protected KieSession createKieSessions() {
        KieSession ksession = container.getKieContainer().newKieSession();
        if (container.isDebugKie()) {
            ksession.addEventListener(new DebugAgendaEventListener());
            ksession.addEventListener(new DebugRuleRuntimeEventListener());
        }
        return ksession;
    }

    /**
     * Method returns the KieSession for rule execution
     * Gets the session object from the pool,
     * If the pool is empty creates a new Kie Session, [GROWTH ON EXHAUSTION]
     *
     * @return KieSession
     */
    public final KieSession borrowKieSession() {
        if (current.get() > 0) {
            current.decrementAndGet();
            return sessions.poll();
        } else
            return createKieSessions();
    }

    /**
     * This method needs to be called to return KieSession to the pool
     *
     * @param session
     */
    public final void returnKieSession(KieSession session) {
        if (!shutdown.get()) {
            sessions.add(session);
            current.incrementAndGet();
        } else {
            session.destroy();
        }
    }
}
