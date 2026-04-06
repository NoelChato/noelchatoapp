# Testing Strategy & Validation Suite

## Overview

This document outlines the comprehensive testing strategy for the Digital Visitor Logbook System. The testing suite ensures system reliability, performance, security, and compliance through automated and manual testing approaches.

## Testing Pyramid

```
End-to-End Tests (10%)
  ↳ API Integration Tests (20%)
    ↳ Component Integration Tests (30%)
      ↳ Unit Tests (40%)
```

## Test Categories

### 1. Unit Tests

**Scope**: Individual functions, methods, and classes
**Framework**: Jest with test coverage reporting
**Coverage Target**: > 80% code coverage

#### Authentication Module Tests
```typescript
describe('AuthService', () => {
  describe('validateUser', () => {
    it('should return user object for valid credentials', async () => {
      // Test implementation
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      // Test implementation
    });

    it('should hash passwords using bcrypt', async () => {
      // Test implementation
    });
  });

  describe('JwtStrategy', () => {
    it('should validate JWT tokens correctly', async () => {
      // Test implementation
    });

    it('should reject expired tokens', async () => {
      // Test implementation
    });
  });
});
```

#### Visitor Service Tests
```typescript
describe('VisitorService', () => {
  describe('checkIn', () => {
    it('should create visitor session with valid data', async () => {
      // Test implementation
    });

    it('should validate required fields', async () => {
      // Test implementation
    });

    it('should prevent duplicate active sessions', async () => {
      // Test implementation
    });
  });
});
```

### 2. Integration Tests

**Scope**: Module interactions and database operations
**Framework**: Jest with Supertest for API testing
**Database**: Test database with automatic cleanup

#### API Integration Tests
```typescript
describe('Authentication API', () => {
  it('POST /auth/login - should authenticate valid user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@school.edu',
        password: 'validPassword123'
      })
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
    expect(response.body.user).toHaveProperty('role');
  });

  it('POST /auth/login - should reject invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@school.edu',
        password: 'wrongPassword'
      })
      .expect(401);
  });
});
```

#### Database Integration Tests
```typescript
describe('Visitor Repository', () => {
  let visitorRepository: Repository<Visitor>;

  beforeEach(async () => {
    visitorRepository = getRepository(Visitor);
  });

  it('should save visitor with all required fields', async () => {
    const visitor = new Visitor();
    visitor.firstName = 'John';
    visitor.lastName = 'Doe';
    visitor.idNumber = 'ID123456';

    const savedVisitor = await visitorRepository.save(visitor);
    expect(savedVisitor.id).toBeDefined();
    expect(savedVisitor.createdAt).toBeDefined();
  });

  it('should enforce unique ID number constraint', async () => {
    await expect(async () => {
      await visitorRepository.save([
        { firstName: 'John', lastName: 'Doe', idNumber: 'DUPLICATE' },
        { firstName: 'Jane', lastName: 'Smith', idNumber: 'DUPLICATE' }
      ]);
    }).rejects.toThrow();
  });
});
```

### 3. End-to-End Tests

**Scope**: Complete user workflows and system integration
**Framework**: Cypress for web interface, Jest with Supertest for API
**Environment**: Staging environment mirroring production

#### User Workflow Tests
```typescript
describe('Visitor Check-in Workflow', () => {
  it('should complete full check-in process', () => {
    // Security guard logs in
    cy.visit('/login');
    cy.get('[data-cy=email]').type('guard@school.edu');
    cy.get('[data-cy=password]').type('password123');
    cy.get('[data-cy=login-button]').click();

    // Navigate to check-in page
    cy.get('[data-cy=checkin-menu]').click();

    // Fill visitor information
    cy.get('[data-cy=first-name]').type('John');
    cy.get('[data-cy=last-name]').type('Doe');
    cy.get('[data-cy=id-number]').type('ID123456');
    cy.get('[data-cy=purpose]').select('meeting');

    // Submit check-in
    cy.get('[data-cy=checkin-button]').click();

    // Verify success
    cy.get('[data-cy=success-message]').should('be.visible');
    cy.get('[data-cy=visitor-badge]').should('contain', 'John Doe');
  });
});
```

#### API E2E Tests
```typescript
describe('Complete Visitor Lifecycle', () => {
  let visitorId: string;
  let sessionId: string;
  let authToken: string;

  beforeAll(async () => {
    // Authenticate and get token
    const authResponse = await request(baseUrl)
      .post('/auth/login')
      .send({ email: 'guard@school.edu', password: 'password123' });

    authToken = authResponse.body.access_token;
  });

  it('should create visitor profile', async () => {
    const response = await request(baseUrl)
      .post('/visitors')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        idNumber: 'ID123456',
        phone: '+1234567890'
      })
      .expect(201);

    visitorId = response.body.id;
    expect(response.body).toHaveProperty('id');
  });

  it('should check-in visitor', async () => {
    const response = await request(baseUrl)
      .post('/visitors/checkin')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        visitorId: visitorId,
        purpose: 'meeting',
        host: 'Mrs. Johnson'
      })
      .expect(201);

    sessionId = response.body.sessionId;
    expect(response.body).toHaveProperty('checkInTime');
  });

  it('should check-out visitor', async () => {
    const response = await request(baseUrl)
      .post('/visitors/checkout')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        sessionId: sessionId,
        notes: 'Meeting completed successfully'
      })
      .expect(200);

    expect(response.body).toHaveProperty('checkOutTime');
    expect(response.body).toHaveProperty('duration');
  });
});
```

## Performance Testing

### Load Testing
```typescript
describe('Performance Tests', () => {
  it('should handle 100 concurrent check-ins', async () => {
    const checkInPromises = Array(100).fill().map((_, i) =>
      request(baseUrl)
        .post('/visitors/checkin')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          visitorId: `visitor_${i}`,
          purpose: 'meeting'
        })
    );

    const startTime = Date.now();
    const responses = await Promise.all(checkInPromises);
    const endTime = Date.now();

    // All requests should succeed
    responses.forEach(response => {
      expect(response.status).toBe(201);
    });

    // Should complete within 10 seconds
    expect(endTime - startTime).toBeLessThan(10000);
  });
});
```

### Stress Testing
- **Concurrent Users**: Test with 500+ simultaneous users
- **Data Volume**: Test with 1M+ visitor records
- **Memory Usage**: Monitor for memory leaks
- **Database Performance**: Test query performance under load

## Security Testing

### Authentication Tests
```typescript
describe('Security Tests', () => {
  it('should prevent unauthorized access', async () => {
    await request(baseUrl)
      .get('/visitors')
      .expect(401);
  });

  it('should validate JWT tokens', async () => {
    const invalidToken = 'invalid.jwt.token';

    await request(baseUrl)
      .get('/visitors')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);
  });

  it('should enforce role-based access', async () => {
    // Login as security guard
    const guardAuth = await request(baseUrl)
      .post('/auth/login')
      .send({ email: 'guard@school.edu', password: 'password123' });

    // Try to access admin-only endpoint
    await request(baseUrl)
      .get('/admin/reports')
      .set('Authorization', `Bearer ${guardAuth.body.access_token}`)
      .expect(403);
  });
});
```

### Input Validation Tests
```typescript
describe('Input Validation', () => {
  it('should reject SQL injection attempts', async () => {
    const maliciousInput = "'; DROP TABLE visitors; --";

    await request(baseUrl)
      .post('/visitors')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: maliciousInput,
        lastName: 'Doe'
      })
      .expect(400);
  });

  it('should validate email formats', async () => {
    await request(baseUrl)
      .post('/auth/register')
      .send({
        email: 'invalid-email',
        password: 'password123'
      })
      .expect(400);
  });

  it('should enforce field length limits', async () => {
    const longString = 'a'.repeat(1000);

    await request(baseUrl)
      .post('/visitors')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: longString,
        lastName: 'Doe'
      })
      .expect(400);
  });
});
```

## Compliance Testing

### Privacy Regulation Tests
```typescript
describe('GDPR Compliance', () => {
  it('should implement right to erasure', async () => {
    // Create test data
    const createResponse = await request(baseUrl)
      .post('/visitors')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testVisitorData);

    const visitorId = createResponse.body.id;

    // Request data deletion
    await request(baseUrl)
      .delete(`/visitors/${visitorId}/gdpr`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Verify data is deleted/anonymized
    await request(baseUrl)
      .get(`/visitors/${visitorId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });

  it('should provide data portability', async () => {
    const response = await request(baseUrl)
      .get('/visitors/export')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Verify export contains all user data
    expect(response.body).toHaveProperty('personalData');
    expect(response.body).toHaveProperty('visitHistory');
    expect(response.headers['content-type']).toBe('application/json');
  });
});
```

### FERPA Compliance Tests
```typescript
describe('FERPA Compliance', () => {
  it('should restrict access to educational records', async () => {
    // Non-authorized user tries to access student-related data
    await request(baseUrl)
      .get('/visitors/student-records')
      .set('Authorization', `Bearer ${externalToken}`)
      .expect(403);
  });

  it('should audit access to sensitive records', async () => {
    await request(baseUrl)
      .get('/visitors/sensitive/123')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // Verify audit log entry was created
    const auditResponse = await request(baseUrl)
      .get('/audit/logs')
      .set('Authorization', `Bearer ${adminToken}`);

    const accessLog = auditResponse.body.logs.find(
      log => log.action === 'access_sensitive_record'
    );
    expect(accessLog).toBeDefined();
    expect(accessLog.userId).toBe(userId);
  });
});
```

## Test Automation

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: visitor_logbook_test

    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: mysql://root:test@localhost:3306/visitor_logbook_test

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Generate coverage report
        run: npm run test:cov

      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

### Test Data Management
```typescript
// test/data/test-data.ts
export const testUsers = {
  admin: {
    email: 'admin@school.edu',
    password: 'AdminPass123!',
    role: 'administrator'
  },
  guard: {
    email: 'guard@school.edu',
    password: 'GuardPass123!',
    role: 'security_guard'
  }
};

export const testVisitors = [
  {
    firstName: 'John',
    lastName: 'Doe',
    idNumber: 'ID123456',
    phone: '+1234567890',
    email: 'john.doe@email.com'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    idNumber: 'ID789012',
    phone: '+1987654321',
    email: 'jane.smith@email.com'
  }
];
```

## Test Reporting

### Coverage Reports
```json
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/main.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Performance Benchmarks
```typescript
describe('Performance Benchmarks', () => {
  it('should maintain response times under load', async () => {
    const metrics = {
      auth: { p95: 100, p99: 200 },
      checkin: { p95: 500, p99: 1000 },
      search: { p95: 500, p99: 2000 },
      report: { p95: 30000, p99: 60000 }
    };

    // Run performance tests and validate against benchmarks
    const results = await runPerformanceTests();

    Object.keys(metrics).forEach(endpoint => {
      expect(results[endpoint].p95).toBeLessThan(metrics[endpoint].p95);
      expect(results[endpoint].p99).toBeLessThan(metrics[endpoint].p99);
    });
  });
});
```

## Manual Testing Checklist

### Functional Testing
- [ ] User registration and login
- [ ] Visitor check-in/check-out process
- [ ] Search and filtering functionality
- [ ] Report generation and export
- [ ] Dashboard data accuracy
- [ ] Mobile responsiveness

### Usability Testing
- [ ] Intuitive user interface
- [ ] Clear error messages
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Performance on slow connections

### Compatibility Testing
- [ ] Chrome, Firefox, Safari, Edge
- [ ] Desktop and mobile browsers
- [ ] Different screen resolutions
- [ ] Various network conditions

### Security Testing
- [ ] Penetration testing
- [ ] Vulnerability scanning
- [ ] Security headers validation
- [ ] Data encryption verification

## Test Environment Setup

### Local Development
```bash
# Start test database
docker run -d --name mysql-test -e MYSQL_ROOT_PASSWORD=test -p 3306:3306 mysql:8.0

# Run tests
npm run test:all

# View coverage report
open coverage/lcov-report/index.html
```

### Staging Environment
- Mirror production configuration
- Automated deployment from main branch
- Separate test data from production
- Performance monitoring enabled

### Production Monitoring
- Automated smoke tests after deployment
- Performance regression alerts
- Error rate monitoring
- User impact assessment

## Continuous Testing

### Pre-commit Hooks
```bash
#!/bin/sh
# .husky/pre-commit
npm run lint
npm run test:unit
npm run test:integration
```

### Automated Regression Testing
- Daily full test suite execution
- Performance regression detection
- Security vulnerability scanning
- Dependency update testing

### Test Maintenance
- Regular review of flaky tests
- Update tests for code changes
- Remove obsolete test cases
- Add tests for new features

## Success Metrics

### Test Coverage
- **Unit Tests**: > 80% coverage
- **Integration Tests**: All critical paths covered
- **E2E Tests**: All user workflows tested
- **Performance Tests**: All SLAs validated

### Quality Gates
- All tests pass before merge
- No critical security vulnerabilities
- Performance benchmarks met
- Code review approval required

### Monitoring
- Test execution time < 10 minutes
- Zero failing tests in main branch
- < 5% flaky test rate
- Weekly test coverage reports
