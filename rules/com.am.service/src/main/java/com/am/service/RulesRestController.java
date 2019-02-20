package com.am.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RulesRestController {
  
  @Autowired
  private Environment environment;
  
  @PostMapping("/api/rules")
  public void executePricingRules(){
    
  }
}