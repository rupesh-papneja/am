#include "user.h"
#include <string>

namespace Service
{
User::User(): user(""), password("")
{
}
User::~User() = default;

std::string User::_user()
{
  return user;
}

User* User::_setUser(std::string user)
{
  this->user = user;
  return this;
}

std::string User::_password()
{
  return password;
}

User* User::_setPassword(std::string password)
{
  this->password = password;
  return this;
}

std::string User::_json()
{
  return "{ \"user\": \"" + user + "\", \"password\": \"" + password + "\"}";
}
}
