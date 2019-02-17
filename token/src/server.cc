#include <algorithm>

#include <pistache/http.h>
#include <pistache/router.h>
#include <pistache/endpoint.h>
#include "auth.h"
#include <ldap.h>
#include "ldapio.h"
#include "jwt.h"
#include <map>
#include <ctime>
#include <iomanip>
#include "picojson.h"

using namespace Pistache;
using namespace Service;
using namespace Rest;
/**
 * https://github.com/Thalhammer/jwt-cpp
 * 
 * */
namespace Generic
{

const std::string origins[] = {"https://prdocker.com.au", "https://www.prdocker.com.au"};

void cors(const Rest::Request &request, Http::ResponseWriter *response)
{
  std::string _TRUE = "TRUE";
  if (std::getenv("ALLOW_ALL_ORIGINS") && _TRUE.compare(std::getenv("ALLOW_ALL_ORIGINS")) == 0)
  {
    response->headers().add<Http::Header::AccessControlAllowOrigin>("*");
  }
  else if (!request.headers().tryGetRaw("origin").isEmpty() || !request.headers().tryGetRaw("Origin").isEmpty())
  {
    auto origin = request.headers().tryGetRaw("origin").isEmpty() ? request.headers().getRaw("Origin") : request.headers().getRaw("origin");
    std::string v = origin.value();
    for (size_t r = 0; r < origins->length(); r++)
    {
      if (origins[r].compare(v) == 0)
      {
        response->headers().add<Http::Header::AccessControlAllowOrigin>(origins[r]);
        break;
      }
    }
  }
  else
  {
    response->headers().add<Http::Header::AccessControlAllowOrigin>("https://prdocker.com.au, https://www.prdocker.com.au");
  }
  response->headers().add<Http::Header::AccessControlAllowMethods>("POST, GET, OPTIONS");
  response->headers().add<Http::Header::AccessControlAllowHeaders>("Origin, X-Requested-With, Content-Type, Accept, x-auth-token, x-request-id, x-app-namespace");
}

void heartbeat(const Rest::Request &request, Http::ResponseWriter response)
{
  cors(request, &response);
  response.send(Http::Code::Ok, "{\"message\": \"server running\"}", MIME(Application, Json));
}

void options(const Rest::Request &request, Http::ResponseWriter response)
{
  cors(request, &response);
  response.send(Http::Code::Ok);
}

} // namespace Generic

class Process
{
private:
  LdapIO *ldapIO;
  LDAPIO_CONFIG config;

public:
  LdapIO *_ldap()
  {
    return this->ldapIO;
  }
  void setup()
  {
    std::string _TRUE = "TRUE";
    config.admin_dn = std::getenv("LDAP_ADMIN_DN") ? std::getenv("LDAP_ADMIN_DN") : "cn=admin,dc=prdocker,dc=com,dc=au";
    config.admin_pwd = std::getenv("LDAP_ADMIN_PWD") ? std::getenv("LDAP_ADMIN_PWD") : "";
    config.url = std::getenv("LDAP_URL") ? std::getenv("LDAP_URL") : "ldaps://localhost:636";
    config.cipher_suite = "NORMAL";
    config.cert_path = std::getenv("LDAP_CERT_PATH") ? std::getenv("LDAP_CERT_PATH") : "/home/service/server.crt";
    config.key_path = std::getenv("LDAP_KEY_PATH") ? std::getenv("LDAP_KEY_PATH") : "/home/service/server.key";
    config.ignore_ssl_verify = std::getenv("LDAP_IGNORE_SSL") && _TRUE.compare(std::getenv("LDAP_IGNORE_SSL")) == 0 ? true : false;
    config.debug_level = std::getenv("DEBUG_LEVEL") ? std::stoi(std::getenv("DEBUG_LEVEL")) : 7;
    config.timeout = std::getenv("TIMEOUT") ? std::stoi(std::getenv("TIMEOUT")) : 5000;
    config.result_size = std::getenv("RESULT_SIZE") ? std::stoi(std::getenv("RESULT_SIZE")) : 100;

    ldapIO = new LdapIO(&config);
    if (ldapIO->initialize() != 0)
    {
      std::cout << "Unable to initialize connection to AUTHENTICATION en AUTHORIZATION store" << std::endl;
      exit(1);
    }
  }

  void bind()
  {
    if (!config.bind)
    {
      if (ldapIO->bind() != 0)
      {
        std::cout << "Unable to bind to AUTHENTICATION en AUTHORIZATION store" << std::endl;
        exit(1);
      }
    }
    /* if (ldapIO->unbind() != 0)
      {
        std::cout << "Unable to unbind to AUTHENTICATION en AUTHORIZATION store" << std::endl;
        // exit(1);
      } */
  }
  void reset()
  {
    ldapIO->reset();
  }
};

class Server
{
public:
  Server(Address addr)
      : httpEndpoint(std::make_shared<Http::Endpoint>(addr)),
        process(new Process())
  {
    process->setup();
  }

  void init(size_t thr = 2)
  {
    auto opts = Http::Endpoint::options()
                    .threads(thr)
                    .flags(Tcp::Options::InstallSignalHandler | Tcp::Options::ReuseAddr);
    httpEndpoint->init(opts);
    setupRoutes();
  }
  void start()
  {
    httpEndpoint->setHandler(router.handler());
    httpEndpoint->serve();
  }

  void shutdown()
  {
    httpEndpoint->shutdown();
  }

  ~Server()
  {
    this->shutdown();
  }

private:
  void setupRoutes()
  {
    Routes::Options(router, "/api/token", Routes::bind(&Generic::options));
    Routes::Get(router, "/api/token", Routes::bind(&Server::doAuth, this));
    Routes::Post(router, "/api/token", Routes::bind(&Server::auth, this));
    Routes::Get(router, "/api/token/ping", Routes::bind(&Generic::heartbeat));
    Routes::Get(router, "/api/token/pset", Routes::bind(&Server::reset, this));
    Routes::Get(router, "/api/token/verify", Routes::bind(&Server::verify, this));
  }

  void reset(const Rest::Request &request, Http::ResponseWriter response)
  {
    Generic::cors(request, &response);
    process->reset();
    response.send(Http::Code::Ok);
  }

  void verify(const Rest::Request &request, Http::ResponseWriter response)
  {
    Generic::cors(request, &response);
    std::string token_signer = std::getenv("TOKEN_SIGNER");
    try { 
      auto header = request.headers().getRaw("x-auth-token");
      auto token = header.value();
      auto decoded = jwt::decode(token);
      auto verifier = jwt::verify()
        .allow_algorithm(jwt::algorithm::hs256{token_signer})
        .with_issuer("auth0");
      verifier.verify(decoded);
      response.send(Http::Code::Ok);
     } catch (...) { 
      response.send(Http::Code::Forbidden);
     }
  }

  void auth(const Rest::Request &request, Http::ResponseWriter response)
  {
    Generic::cors(request, &response);
    picojson::value v;
    std::string err = picojson::parse(v, request.body());
    if (!err.empty())
    {
      response.send(Http::Code::Bad_Request, "{\"message\": \"Invalid Input\"}", MIME(Application, Json));
      return;
    }
    if (!v.is<picojson::object>())
    {
      response.send(Http::Code::Bad_Request, "{\"message\": \"Invalid Input\"}", MIME(Application, Json));
      return;
    }

    std::string u, pin, entity = "user", org = "users", reference = "";

    // obtain a const reference to the map, and print the contents
    const picojson::value::object &obj = v.get<picojson::object>();
    picojson::value::object::const_iterator pos = obj.find("user");
    if (pos != obj.end())
    {
      u = pos->second.to_str();
    }
    pos = obj.find("password");
    if (pos != obj.end())
    {
      pin = pos->second.to_str();
    }
    pos = obj.find("entity");
    if (pos != obj.end())
    {
      entity = pos->second.to_str();
      org = entity.compare("application") == 0 ? "applications" : "users";
    }

    process->bind();
    std::string dn = "uid=" + u + ", ou=" + org + ", dc=prdocker, dc=com, dc=au";
    // std::string entity = "application";
    std::string token_signer = std::getenv("TOKEN_SIGNER");
    LdapIO *ldapio = process->_ldap();
    std::chrono::time_point<std::chrono::system_clock> now = std::chrono::system_clock::now();
    std::time_t t = std::chrono::system_clock::to_time_t(
        now + std::chrono::seconds(900));
    char mbstr[100];
    std::strftime(mbstr, sizeof(mbstr), "%Y-%m-%dT%H:%M:%S.000Z", std::localtime(&t));
    std::map<std::string, std::string *> attrs;
    int result = ldapio->search(dn, pin, &attrs);
    if (result != 0)
    {
      response.send(Http::Code::Forbidden, "{\"message\": \"User not configured\"}", MIME(Application, Json));
      return;
    }
    std::map<std::string, std::string *>::iterator it;
    it  = attrs.find("cn"); 
    if (it != attrs.end())
    {
      reference = (it->second)[0];
    } 
    
    Service::Auth *a = new Auth();
    a->_setToken(jwt::create()
                     .set_issuer("auth0")
                     .set_type("JWS")
                     .set_expires_at(std::chrono::system_clock::from_time_t(t))
                     .set_payload_claim("dn", dn)
                     .set_payload_claim("pin", pin)
                     .set_payload_claim("entity", entity)
                     .set_payload_claim("reference", reference)
                     .set_payload_claim("validTill", std::string(mbstr))
                     .sign(jwt::algorithm::hs256{token_signer}));
    response.cookies()
        .add(Http::Cookie("lang", "en-US"));
    response.send(Http::Code::Ok, a->_json(), MIME(Application, Json));
  }

  void doAuth(const Rest::Request &request, Http::ResponseWriter response)
  {
    Generic::cors(request, &response);
    process->bind();
    std::string dn = "uid=web, ou=applications, dc=prdocker, dc=com, dc=au";
    std::string reference = "web";
    std::string entity = "application";
    std::string pin = std::getenv("DP");
    std::string token_signer = std::getenv("TOKEN_SIGNER");
    LdapIO *ldapio = process->_ldap();
    std::chrono::time_point<std::chrono::system_clock> now = std::chrono::system_clock::now();
    std::time_t t = std::chrono::system_clock::to_time_t(
        now + std::chrono::seconds(30));
    char mbstr[100];
    std::strftime(mbstr, sizeof(mbstr), "%Y-%m-%dT%H:%M:%S.000Z", std::localtime(&t));
    std::map<std::string, std::string *> attrs;
    int result = ldapio->search(dn, pin, &attrs);
    if (result != 0)
    {
      response.send(Http::Code::Forbidden, "{\"message\": \"User not configured\"}", MIME(Application, Json));
      return;
    }
    /* std::map<std::string, std::string *>::iterator it;
    it  = attrs.find("cn");
    if (it != attrs.end())
    {
      response.headers().add<Http::Header::Location>((it->second)[0]);
    } */
    Service::Auth *a = new Auth();
    a->_setToken(jwt::create()
                     .set_issuer("auth0")
                     .set_type("JWS")
                     .set_expires_at(std::chrono::system_clock::from_time_t(t))
                     .set_payload_claim("dn", dn)
                     .set_payload_claim("pin", pin)
                     .set_payload_claim("entity", entity)
                     .set_payload_claim("reference", reference)
                     .set_payload_claim("validTill", std::string(mbstr))
                     .sign(jwt::algorithm::hs256{token_signer}));
    response.cookies()
        .add(Http::Cookie("lang", "en-US"));
    response.send(Http::Code::Ok, a->_json(), MIME(Application, Json));
  }

  std::shared_ptr<Http::Endpoint> httpEndpoint;
  Rest::Router router;
  Process *process;
};

int main(int argc, char *argv[])
{
  Port port(9009);
  int thr = 2;

  const char *p = std::getenv("PORT");
  if (p != NULL)
  {
    port = std::stol(p);
  }
  const char *t = std::getenv("THREADS");
  if (t != NULL)
  {
    thr = std::stol(t);
  }
  Address addr(Ipv4::any(), port);
  Server s(addr);
  s.init(thr);
  s.start();

  s.shutdown();
}
