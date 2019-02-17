#ifndef AUTH_H
#define AUTH_H

#ifdef _MSC_VER
#pragma once
#endif  // _MSC_VER

#include <string>

namespace Service
{
class Auth
{
private:
  std::string key;
  std::string secret;
  std::string token;

public:
  Auth();
  ~Auth();
  std::string _key();
  Auth* _setKey(std::string);
  std::string _secret();
  Auth* _setSecret(std::string);
  std::string _token();
  Auth* _setToken(std::string);
  std::string _json();
};
} // namespace Auth
#endif