set(SOURCE_FILES
    auth.cc
    ldapio.cc
    user.cc
)
add_library(token ${SOURCE_FILES})
set(SERVER_SRC
  server.cc
)
add_executable(server ${SERVER_SRC})
target_link_libraries(token ${common_libraries})
target_link_libraries(server ${PISTACHE_LIBS} ${common_libraries} token)