# Next Session

## PostgreSQL Runtime with Docker Compose

1. Add a PostgreSQL service to a root Docker Compose file.
2. Add a named volume so local database data persists.
3. Configure Spring Boot runtime datasource values through environment variables.
4. Keep H2 as the integration-test database.
5. Start PostgreSQL in Docker and run Spring Boot locally.
6. Verify the existing CRUD workflow against PostgreSQL.

The frontend API client, Spring integration-testing, and first React component-testing milestones are complete. The detailed infrastructure sequence is documented in `docs/cloud-native-plan.md`. The fixed user ID remains temporary and will be replaced after authentication and JWT support are implemented.
