package com.am.rules;

import com.am.beans.Transaction;
import org.junit.Test;

import java.math.BigDecimal;


/**
 * Test for RulesService
 */
public class RulesServiceTest {

    @Test
    public void testExecute() {
        new RulesService().execute(new Transaction("1", "WineTours", new BigDecimal(0), 2));
    }
}
