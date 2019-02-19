package com.am.rules.base;

import org.kie.api.KieServices;
import org.kie.api.builder.KieBuilder;
import org.kie.api.builder.KieFileSystem;
import org.kie.api.builder.ReleaseId;
import org.kie.api.builder.model.KieBaseModel;
import org.kie.api.builder.model.KieModuleModel;
import org.kie.api.builder.model.KieSessionModel;
import org.kie.api.conf.EqualityBehaviorOption;
import org.kie.api.conf.EventProcessingOption;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.conf.ClockTypeOption;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * This class encapsulates the logic to create runtime environment for the Drools 7 rules engine.
 * The implementation uses In-memory file system and module.
 **/

public final class RulesContainer {
    /**
     * Logger for the class
     */
    private static final Logger log = Logger.getLogger(RulesContainer.class.getName());

    /**
     * Kie service and file system
     */
    private final KieServices ks;
    private final KieFileSystem kfs;

    /**
     * Package name as passed during the bean creation
     */
    private final String packageName;
    /**
     * Package structure derived based on package name, used to map package name to folders
     */
    private final String packageStructure;

    /**
     * Release version details for Kie Module
     */
    private final ReleaseId rid;
    private final String version;

    /**
     * KieBuilder used to compile and build rules
     */
    private final KieBuilder kieBuilder;
    /**
     * Kie container, a container for Kie modules and used to create Kie sessions
     */
    private final KieContainer kieContainer;

    /**
     * Flag that can be set for printing debugging logs while rule execution, used the default implementation provided
     * by Kie
     */
    private final boolean debugKie;

    /**
     * Constructor, values passed using bean definition in application context xml
     *
     * @param packageName : package name for the rules
     * @param debugKie    : debug flag which can be used to debug rule execution, uses default implementation as provided
     *                    by Kie
     */

    protected RulesContainer(String packageName, String version, boolean debugKie) {
        this.packageName = packageName;
        this.debugKie = debugKie;
        this.packageStructure = "src/main/resources/" + packageName.replaceAll("\\.", "/") + "/";
        this.version = version;

        ks = KieServices.Factory.get();
        kfs = ks.newKieFileSystem();

        rid = ks.newReleaseId("com.am.rules", "am-service-rules", this.version);

        //generating the basic kie rules runtime
        kfs.generateAndWritePomXML(rid);
        initKieModuleModel(kfs);
        kieBuilder = ks.newKieBuilder(kfs);
        kieBuilder.buildAll();
        kieContainer = ks.newKieContainer(rid);
    }

    /**
     * returns package structure
     *
     * @return String
     */
    protected final String getPackageStructure() {
        return packageStructure;
    }

    /**
     * Returns Kie runtime file fystem
     *
     * @return KieFileSystem
     */
    protected final KieFileSystem getKieFileSystem() {
        return kfs;
    }

    /**
     * Returns Kie runtime builder used to compile drls
     *
     * @return
     */
    protected final KieBuilder getKieBuilder() {
        return kieBuilder;
    }

    /**
     * Returns Kie runtime Container that holds the rules module and is used to create session
     *
     * @return
     */
    protected final KieContainer getKieContainer() {
        return kieContainer;
    }

    /**
     * Returns the release id used for generated internally
     *
     * @return ReleaseId
     */
    protected final ReleaseId getReleaseId() {
        return rid;
    }

    /**
     * Flag that is initialized when need to debug the rules execution, uses default implementation as provided by Kie
     *
     * @return boolean
     */
    protected final boolean isDebugKie() {
        return debugKie;
    }

    /**
     * Initializes the Kie module
     *
     * @param kfs : KieFileSystem
     * @return KieModuleModel
     */
    private KieModuleModel initKieModuleModel(KieFileSystem kfs) {
        log.log(Level.INFO, "Initializing the KieModule and KieBase");
        KieModuleModel kieModuleModel = ks.newKieModuleModel();


        KieBaseModel kieBaseModel = kieModuleModel.newKieBaseModel("am-service-rules-module-model")
                .setDefault(true)
                .addPackage(packageName)
                .setEqualsBehavior(EqualityBehaviorOption.EQUALITY)
                .setEventProcessingMode(EventProcessingOption.STREAM);

        kieBaseModel.newKieSessionModel("am-service-rules-session-model")
                .setDefault(true)
                .setType(KieSessionModel.KieSessionType.STATEFUL)
                .setClockType(ClockTypeOption.get("realtime"));

        kfs.writeKModuleXML(kieModuleModel.toXML());

        return kieModuleModel;
    }
}
