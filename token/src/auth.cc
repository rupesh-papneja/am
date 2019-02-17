#include "auth.h"
#include <string>

namespace Service
{
Auth::Auth(): key(""), secret(""), token("")
{
}
Auth::~Auth() = default;

std::string Auth::_key()
{
  return key;
}

Auth* Auth::_setKey(std::string key)
{
  this->key = key;
  return this;
}

std::string Auth::_secret()
{
  return secret;
}

Auth* Auth::_setSecret(std::string secret)
{
  this->secret = secret;
  return this;
}

std::string Auth::_token()
{
  return key;
}

Auth* Auth::_setToken(std::string token)
{
  this->token = token;
  return this;
}

std::string Auth::_json()
{
  return "{ \"token\": \"" + token + "\"}";
}
}
