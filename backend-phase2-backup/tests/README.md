# Backend Tests

This directory contains integration tests for the Converse-to-Clarity backend API.

## Running Tests

From the `backend` directory:

```bash
npm test
```

## Test Environment

- **Test Framework**: Jest
- **HTTP Mocking**: Supertest
- **Database**: mongodb-memory-server (in-memory) or fallback to `MONGO_URI` / localhost

### Architecture Support

The in-memory MongoDB server (mongodb-memory-server) requires a 64-bit Node.js environment. On 32-bit systems (ia32 architecture), tests will automatically skip DB integration tests and log a warning.

To explicitly skip DB tests on any environment:
```bash
SKIP_DB_TESTS=1 npm test
```

### Using a Local/Remote MongoDB

If mongodb-memory-server isn't available, tests will attempt to connect to:
1. `MONGO_URI` environment variable, or
2. `mongodb://localhost:27017/converse-to-clarity-test` (default)

Example with custom MongoDB:
```bash
MONGO_URI=mongodb://localhost:27017/my-test-db npm test
```

## Test Coverage

Current integration tests cover:
- Team creation, member invitation, role changes (owner-only enforcement)
- Owner-transfer endpoint (transfer to member, error cases for non-member and non-owner attempts)
- Permission validation (admin cannot change roles; only owner can)

## CI/CD

Tests run automatically via GitHub Actions on push/pull requests to `main`. See `.github/workflows/ci.yml`.

## Adding New Tests

1. Create a test file in `backend/tests/` (e.g., `myfeature.integration.test.js`)
2. Use the same setup pattern (beforeAll/afterAll hooks, mongodb-memory-server fallback)
3. Run `npm test` locally to verify
4. Commit and push — CI will run the tests automatically
