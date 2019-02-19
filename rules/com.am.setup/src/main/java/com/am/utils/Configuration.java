package com.am.utils;

import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Static/Singleton implementation to populate application level configuration.
 * The configuration is being populated from config file.
 *
 * @author rupesh papneja
 */
public final class Configuration {

    private static final Logger LOG = Logger.getLogger(Configuration.class
            .getName());

    private static Configuration instance;

    private Map<String, String> configs = new HashMap<String, String>();

    private Configuration() {

    }

    public final static Configuration getInstance() {
        if (null == instance) {
            instance = new Configuration();
            instance.init();
        }
        return instance;
    }

    private void init() {
        readConfigurations();
        validateAndSetDefaults();
    }

    public String get(String key) {
        return configs.get(key);
    }

    /**
     * load config values from properties file
     */
    private void readConfigurations() {
        ResourceBundle rb = ResourceBundle.getBundle("config", Locale.ENGLISH);
        if (null != rb) {
            Iterator<String> intertor = rb.keySet().iterator();
            while (intertor.hasNext()) {
                String key = intertor.next();
                configs.put(key, rb.getString(key));
            }
        } else
            LOG.severe("Properties file not present");
    }

    /**
     * Validates the configuration and set defaults.
     */
    private void validateAndSetDefaults() {
        configs.putIfAbsent("LOG_LEVEL", "INFO");
        configs.putIfAbsent("RULES_DEBUG_EXECUTION", "false");
        configs.putIfAbsent("RULES_DRL_PACKAGE", "com.am.rules.definitions");
        try {
            Level.parse(configs.get("LOG_LEVEL"));
        } catch (IllegalArgumentException e) {
            configs.put("LOG_LEVEL", "INFO");
        }
        try {
            Integer.parseInt(configs.get("RULES_POOL_SIZE"));
        } catch (IllegalArgumentException e) {
            configs.put("RULES_POOL_SIZE", "10");
        }
    }

    public void setConfiguration(String key, String value) {
        configs.put(key, value);
    }
}
