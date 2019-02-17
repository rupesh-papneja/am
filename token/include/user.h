#ifndef USER_H
#define USER_H

#ifdef _MSC_VER
#pragma once
#endif  // _MSC_VER

#include <string>

namespace Service
{
class User
{
private:
  std::string user;
  std::string password;

public:
  User();
  ~User();
  std::string _user();
  User* _setUser(std::string);
  std::string _password();
  User* _setPassword(std::string);
  std::string _json();
};
} // namespace User
#endif