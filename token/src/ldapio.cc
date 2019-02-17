#include "ldapio.h"
#include <string>
#include <ldap.h>
#include <iostream>
#include <sys/time.h>
#include <map>

namespace Service
{
LdapIO::LdapIO()
{
}
LdapIO::LdapIO(LDAPIO_CONFIG *config)
{
  this->config = config;
}
LdapIO::~LdapIO()
{
  if (this->ldap != NULL)
  {
    try
    {
      ldap_unbind_ext_s(this->ldap, NULL, NULL);
      this->ldap = NULL;
    }
    catch (...)
    {
      // ignoring the exception
    }
    delete &config;
  }
}

LDAPIO_CONFIG *LdapIO::_config()
{
  return this->config;
}
int LdapIO::unbind()
{
  try
  {
    ldap_unbind_ext_s(this->ldap, NULL, NULL);
    config->bind = false;
  }
  catch (...)
  {
    return -1;
  }
  return 0;
}
int LdapIO::reset()
{
  this->unbind();
  this->initialize();
  this->bind();
  return 0;
}
int LdapIO::bind()
{
  try
  {
    berval creds; // User creds
    creds.bv_val = (char *)config->admin_pwd.c_str();
    creds.bv_len = config->admin_pwd.length();

    int result = ldap_sasl_bind_s(
        ldap,
        config->admin_dn.c_str(),
        NULL, // Simple bind mechanism
        &creds,
        NULL,
        NULL,
        NULL);
    if (result != LDAP_SUCCESS)
    {
      fprintf(stderr, "ldap_sasl_bind_s(): %s\n", ldap_err2string(result));
      ldap_unbind_ext_s(ldap, NULL, NULL);
      return (1);
    }
    else
    {
      printf("ldap_sasl_bind_s done.\n");
      this->config->bind = true;
    }
  }
  catch (std::exception &e)
  {
    std::cout << e.what() << std::endl;
    return -1;
  }
  return 0;
}

int LdapIO::search(std::string dn, std::string pin, std::map<std::string, std::string *> * attrs)
{
  LDAPMessage *res;
  std::string filter = "(&(userPassword=" + pin + ")(info=verified))"; // strcat((char *)attr.c_str(), pin.c_str())
  char *attribute_types[] = {LDAP_ALL_USER_ATTRIBUTES, LDAP_ALL_OPERATIONAL_ATTRIBUTES, NULL};
  struct timeval search_timeout;
  search_timeout.tv_sec = config->timeout;
  int result = ldap_search_ext_s(this->ldap,
                                 dn.c_str(),
                                 LDAP_SCOPE_BASEOBJECT, // int               scope
                                 filter.c_str(),        // char            * filter
                                 attribute_types,       // char            * attrs[]
                                 0,                     // int               attrsonly
                                 NULL,                  // LDAPControl    ** serverctrls
                                 NULL,                  // LDAPControl    ** clientctrls
                                 &search_timeout,       // struct timeval  * timeout
                                 this->config->result_size,
                                 &res);
  if (result != LDAP_SUCCESS)
  {
    // fprintf(stderr, "ldap_search_ext_s(): %s\n", ldap_err2string(result));
    return 1;
  }
  else
  {
    if (!(ldap_count_entries(ldap, res)))
    {
      printf("0 entries found.\n");
      return 1;
    }
    LDAPMessage *entry = ldap_first_entry(ldap, res);
    while ((entry))
    {
      char *dn = ldap_get_dn(ldap, entry);
      ldap_memfree(dn);
      BerElement *ber;
      BerValue **vals;
      char *attribute = ldap_first_attribute(ldap, entry, &ber);
      while ((attribute))
      {
        vals = ldap_get_values_len(ldap, entry, attribute);
        char **v = new char *[ldap_count_values_len(vals)];
        std::string * v_ = new std::string[ldap_count_values_len(vals)];
        for (int pos = 0; pos < ldap_count_values_len(vals); pos++)
        {
          // printf("%s: %s\n", attribute, vals[pos]->bv_val);
          v[pos] = vals[pos]->bv_val;
          v_[pos] = std::string(v[pos]);
        }
        std::string att_(attribute);
        attrs->insert(std::pair<std::string, std::string *>(att_, v_));
        ldap_value_free_len(vals);
        attribute = ldap_next_attribute(ldap, entry, ber);
      };
      ber_free(ber, 0);
      ldap_memfree(entry);
      entry = ldap_next_entry(ldap, entry);
    }
  }
  return 0;
}

int LdapIO::initialize()
{
  if ((ldap_url_parse(config->url.c_str(), &ludp)))
  {
    fprintf(stderr, "ldap_url_parse(): invalid LDAP URL\n");
    return (1);
  }
  int opt = config->ignore_ssl_verify ? LDAP_OPT_X_TLS_NEVER : LDAP_OPT_X_TLS_ALLOW; // LDAP_OPT_X_TLS_NEVER; // LDAP_OPT_X_TLS_ALLOW;
  int result = ldap_set_option(0, LDAP_OPT_X_TLS_REQUIRE_CERT, &opt);
  if (result != LDAP_SUCCESS)
  {
    fprintf(stderr, "ldap_set_option(LDAP_OPT_X_TLS_REQUIRE_CERT): %s\n", ldap_err2string(result));
    return (1);
  }
  else
  {
    printf("Set LDAP_OPT_X_TLS_REQUIRE_CERT option as %s: done.\n",
           config->ignore_ssl_verify ? "LDAP_OPT_X_TLS_NEVER" : "LDAP_OPT_X_TLS_ALLOW");
  }
  if ((result = ldap_initialize(&ldap, config->url.c_str())) != LDAP_SUCCESS)
  {
    perror("ldap_init failed");
    return (1);
  }
  else
  {
    printf("Generated LDAP handle.\n");
  }
  result = ldap_set_option(ldap, LDAP_OPT_DEBUG_LEVEL, &config->debug_level);
  if (result != LDAP_OPT_SUCCESS)
  {
    fprintf(stderr, "ldap_set_option(LDAP_OPT_DEBUG_LEVEL): %s\n", ldap_err2string(result));
    ldap_unbind_ext_s(ldap, NULL, NULL);
    return (1);
  }
  else
  {
    printf("Set LDAP_OPT_DEBUG_LEVEL option: done.\n");
  }
  result = ldap_set_option(ldap, LDAP_OPT_PROTOCOL_VERSION, &ldap_version);
  if (result != LDAP_OPT_SUCCESS)
  {
    fprintf(stderr, "ldap_set_option(PROTOCOL_VERSION): %s\n", ldap_err2string(result));
    ldap_unbind_ext_s(ldap, NULL, NULL);
    return (1);
  }
  else
  {
    printf("Set LDAP_OPT_PROTOCOL_VERSION option: done.\n");
  }
  result = ldap_set_option(ldap, LDAP_OPT_NETWORK_TIMEOUT, &config->timeout);
  if (result != LDAP_OPT_SUCCESS)
  {
    fprintf(stderr, "ldap_set_option(LDAP_OPT_NETWORK_TIMEOUT): %s\n", ldap_err2string(result));
    ldap_unbind_ext_s(ldap, NULL, NULL);
    return (1);
  }
  else
  {
    printf("Set LDAP_OPT_NETWORK_TIMEOUT option: done.\n");
  }
  result = ldap_set_option(ldap, LDAP_OPT_SIZELIMIT, &config->result_size);
  if (result != LDAP_OPT_SUCCESS)
  {
    fprintf(stderr, "ldap_set_option(LDAP_OPT_SIZELIMIT): %s\n", ldap_err2string(result));
    ldap_unbind_ext_s(ldap, NULL, NULL);
    return (1);
  }
  else
  {
    printf("Set LDAP_OPT_SIZELIMIT option: done.\n");
  }

  // set SSL/TLS CA cert file
  result = ldap_set_option(ldap, LDAP_OPT_X_TLS_CERTFILE, (void *)config->cert_path.c_str());
  if (result != LDAP_OPT_SUCCESS)
  {
    fprintf(stderr, "ldap_set_option(LDAP_OPT_X_TLS_CERTFILE): %s\n", ldap_err2string(result));
    ldap_unbind_ext_s(ldap, NULL, NULL);
    return (1);
  }
  else
  {
    printf("Set LDAP_OPT_X_TLS_CERTFILE option: done.\n");
  }
  result = ldap_set_option(ldap, LDAP_OPT_X_TLS_KEYFILE, (void *)config->key_path.c_str());
  if (result != LDAP_OPT_SUCCESS)
  {
    fprintf(stderr, "ldap_set_option(LDAP_OPT_X_TLS_KEYFILE): %s\n", ldap_err2string(result));
    ldap_unbind_ext_s(ldap, NULL, NULL);
    return (1);
  }
  else
  {
    printf("Set LDAP_OPT_X_TLS_KEYFILE option: done.\n");
  }
  result = ldap_set_option(ldap, LDAP_OPT_X_TLS_CACERTFILE, (void *)config->cert_path.c_str());
  if (result != LDAP_OPT_SUCCESS)
  {
    fprintf(stderr, "ldap_set_option(LDAP_OPT_X_TLS_CACERTFILE): %s\n", ldap_err2string(result));
    ldap_unbind_ext_s(ldap, NULL, NULL);
    return (1);
  }
  else
  {
    printf("Set LDAP_OPT_X_TLS_CACERTFILE option: done.\n");
  }
  result = ldap_set_option(ldap, LDAP_OPT_X_TLS_CIPHER_SUITE, (void *)config->cipher_suite.c_str());
  if (result != LDAP_OPT_SUCCESS)
  {
    fprintf(stderr, "ldap_set_option(LDAP_OPT_X_TLS_CIPHER_SUITE): %s\n", ldap_err2string(result));
    ldap_unbind_ext_s(ldap, NULL, NULL);
    return (1);
  }
  else
  {
    printf("Set LDAP_OPT_X_TLS_CIPHER_SUITE option: done.\n");
  }
  return 0;
}

} // namespace Service
