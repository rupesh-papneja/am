package com.am.rules.base;

/**
 * Exception type for defining all exceptions that occur during rule compilation and build for
 * Kie modules.
 *
 * @author rupesh papneja.
 */
public class InvalidRuleException extends RuntimeException {
    /**
     * Default serial version id
     */
    private static final long serialVersionUID = 1L;

    /**
     * Overloaded Constructor only accepts string message
     *
     * @param message : String, Message for exception
     */
    public InvalidRuleException(String message) {
        super(message);
    }

    /**
     * Overloaded constructor only accepts throwable object
     *
     * @param cause : Throwable object representing the underlying exception that has occurred
     */
    public InvalidRuleException(Throwable cause) {
        super(cause);
    }
}
