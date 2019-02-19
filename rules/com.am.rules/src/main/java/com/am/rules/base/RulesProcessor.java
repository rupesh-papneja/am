package com.am.rules.base;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.*;
import java.util.Collections;
import java.util.Iterator;
import java.util.stream.Stream;

/**
 * A rules processor responsible for reading rules from a specified package
 */

public final class RulesProcessor {
    /**
     * Package name where drl files are saved
     */
    private String packageName;
    private RulesDataCache cache;

    protected RulesProcessor(String packageName, RulesDataCache cache) {
        this.packageName = "/" + packageName.replace('.', '/');
        this.cache = cache;
    }


    /**
     * Reads the drl file from the given package
     */
    public void fetchRules() throws InvalidRuleException {
        try {
            if (null == getClass().getResource(packageName)) {
                throw new InvalidRuleException("Invalid package name specified.");
            }
            URI uri = getClass().getResource(packageName).toURI();
            Path path;
            if (uri.getScheme().equals("jar")) {
                FileSystem fileSystem = FileSystems.newFileSystem(uri, Collections.emptyMap());
                path = fileSystem.getPath(packageName);
            } else {
                path = Paths.get(uri);
            }
            Stream<Path> walk = Files.walk(path, 10);
            for (Iterator<Path> it = walk.iterator(); it.hasNext(); ) {
                Path p = it.next();
                if (p.getFileName().toString().endsWith(".drl")) {
                    cache.setRule(p.toUri().toString(), new String(Files.readAllBytes(p)));
                }
            }
        } catch (IOException e) {
            throw new InvalidRuleException(e);

        } catch (URISyntaxException e) {
            throw new InvalidRuleException(e);
        }
    }
}
