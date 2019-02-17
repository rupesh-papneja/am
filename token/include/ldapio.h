#ifndef LDAPIO_H
#define LDAPIO_H

#ifdef _MSC_VER
#pragma once
#endif  // _MSC_VER

#include <string>
#include <ldap.h>
#include <map>

namespace Service
{
struct LDAPIO_CONFIG {
  std::string admin_dn;
  std::string admin_pwd;
  std::string url;
  std::string cipher_suite;
  std::string cert_path;
  std::string key_path;
  bool ignore_ssl_verify;
  int debug_level;
  int timeout;
  int result_size;
  bool bind;
};    
class LdapIO
{
private:
  LDAPIO_CONFIG * config;
  LDAP * ldap;
  LDAPURLDesc *ludp;
  int ldap_version = LDAP_VERSION3;
public:
  LdapIO();
  LdapIO(LDAPIO_CONFIG * config);
  ~LdapIO();
  LDAPIO_CONFIG * _config();
  int initialize();
  int bind();
  int unbind();
  int search(std::string dn, std::string pin, std::map<std::string, std::string *> * attrs);
  int reset();
};
} // namespace LdapIO
#endif