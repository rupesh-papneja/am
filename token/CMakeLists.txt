cmake_minimum_required (VERSION 3.0.2)
project (token)

# Setting default folders
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
# In CMakeModules I include code coverage for c++
set(CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}/CMakeModules)

if(NOT CMAKE_VERSION VERSION_LESS 3.1)
    set(CMAKE_CXX_STANDARD 11)
else()
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")
endif()

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -pedantic -pthread -lldap -llber -g -O0")

set(PISTACHE_INCLUDE_DIRS "/usr/local/include/pistache")
set(PISTACHE_LIBS "/usr/local/lib/libpistache.a")
set(STD_INCLUDE "/usr/include")
set(common_libraries stdc++ pthread ldap lber crypto)

find_package( Pistache REQUIRED )

message(STATUS "Pistache library status:")
message(STATUS "    libraries: ${PISTACHE_LIBS}")
message(STATUS "    include path: ${PISTACHE_INCLUDE_DIRS}")

include_directories(${PISTACHE_INCLUDE_DIRS} ${PROJECT_SOURCE_DIR}/include STD_INCLUDE)

# Include .cc files
add_subdirectory(src)
