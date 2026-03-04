---
name: error-handling-patterns
description: Master error handling patterns across languages including exceptions, Result types, error propagation, and graceful degradation to build resilient applications. Use when implementing error handling, designing APIs, or improving application reliability.
---

# Error Handling Patterns

Build resilient applications with robust error handling strategies that gracefully handle failures and provide excellent debugging experiences.

## When to use this skill
- Implementing error handling in new features
- Designing error-resilient APIs
- Debugging production issues
- Improving application reliability
- Creating better error messages for users and developers
- Implementing retry and circuit breaker patterns
- Handling async/concurrent errors
- Building fault-tolerant distributed systems

## Workflow & Core Concepts

### 1. Error Handling Philosophies
* **Exceptions vs Result Types:**
  * **Exceptions:** Traditional try-catch, disrupts control flow (Use for unexpected errors, exceptional conditions)
  * **Result Types:** Explicit success/failure, functional approach (Use for expected errors, validation failures)
  * **Error Codes:** C-style, requires discipline
  * **Option/Maybe Types:** For nullable values
  * **Panics/Crashes:** Unrecoverable errors, programming bugs

### 2. Error Categories
* **Recoverable Errors:** Network timeouts, Missing files, Invalid user input, API rate limits
* **Unrecoverable Errors:** Out of memory, Stack overflow, Programming bugs (null pointer, etc.)

---

## Instructions: Language-Specific Patterns

### Python Error Handling
**Custom Exception Hierarchy:**
```python
class ApplicationError(Exception):
    """Base exception for all application errors."""
    def __init__(self, message: str, code: str = None, details: dict = None):
        super().__init__(message)
        self.code = code
        self.details = details or {}
        self.timestamp = datetime.utcnow()

class ValidationError(ApplicationError):
    """Raised when validation fails."""
    pass

class NotFoundError(ApplicationError):
    """Raised when resource not found."""
    pass

class ExternalServiceError(ApplicationError):
    """Raised when external service fails."""
    def __init__(self, message: str, service: str, **kwargs):
        super().__init__(message, **kwargs)
        self.service = service

# Usage
def get_user(user_id: str) -> User:
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise NotFoundError(
            f"User not found",
            code="USER_NOT_FOUND",
            details={"user_id": user_id}
        )
    return user
```

**Context Managers for Cleanup:**
```python
from contextlib import contextmanager

@contextmanager
def database_transaction(session):
    """Ensure transaction is committed or rolled back."""
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise
    finally:
        session.close()
```

**Retry with Exponential Backoff:**
```python
import time
from functools import wraps
from typing import TypeVar, Callable

T = TypeVar('T')

def retry(
    max_attempts: int = 3,
    backoff_factor: float = 2.0,
    exceptions: tuple = (Exception,)
):
    """Retry decorator with exponential backoff."""
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> T:
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        sleep_time = backoff_factor ** attempt
                        time.sleep(sleep_time)
                        continue
                    raise
            raise last_exception
        return wrapper
    return decorator
```

### TypeScript/JavaScript Error Handling
**Custom Error Classes:**
```typescript
class ApplicationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

class NotFoundError extends ApplicationError {
  constructor(resource: string, id: string) {
    super(`${resource} not found`, "NOT_FOUND", 404, { resource, id });
  }
}
```

**Result Type Pattern:**
```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

function Ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function Err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Chaining Results
function chain<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}
```

### Rust Error Handling
**Result and Option Types:**
```rust
use std::fs::File;
use std::io::{self, Read};

// Result type for operations that can fail
fn read_file(path: &str) -> Result<String, io::Error> {
    let mut file = File::open(path)?;  // ? operator propagates errors
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

#[derive(Debug)]
enum AppError {
    Io(io::Error),
    Parse(std::num::ParseIntError),
    NotFound(String),
    Validation(String),
}

impl From<io::Error> for AppError {
    fn from(error: io::Error) -> Self {
        AppError::Io(error)
    }
}
```

### Go Error Handling
**Explicit Error Returns and Sentinel Errors:**
```go
// Basic error handling
func getUser(id string) (*User, error) {
    user, err := db.QueryUser(id)
    if err != nil {
        return nil, fmt.Errorf("failed to query user: %w", err)
    }
    if user == nil {
        return nil, errors.New("user not found")
    }
    return user, nil
}

// Custom error types
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation failed for %s: %s", e.Field, e.Message)
}

// Sentinel errors for comparison
var (
    ErrNotFound     = errors.New("not found")
    ErrUnauthorized = errors.New("unauthorized")
    ErrInvalidInput = errors.New("invalid input")
)
```

---

## Universal Patterns

### Pattern 1: Circuit Breaker
Prevent cascading failures in distributed systems. (See Example script implementations if provided).

### Pattern 2: Error Aggregation
Collect multiple errors instead of failing on first error.

```typescript
class ErrorCollector {
  private errors: Error[] = [];
  add(error: Error): void { this.errors.push(error); }
  hasErrors(): boolean { return this.errors.length > 0; }
  throw(): never {
    if (this.errors.length === 1) throw this.errors[0];
    throw new AggregateError(this.errors, `${this.errors.length} errors occurred`);
  }
}
```

### Pattern 3: Graceful Degradation
Provide fallback functionality when errors occur.

```python
def with_fallback(primary, fallback, log_error=True):
    """Try primary function, fall back to fallback on error."""
    try:
        return primary()
    except Exception as e:
        if log_error:
            logger.error(f"Primary function failed: {e}")
        return fallback()
```

---

## Best Practices

* **Fail Fast:** Validate input early, fail quickly
* **Preserve Context:** Include stack traces, metadata, timestamps
* **Meaningful Messages:** Explain what happened and how to fix it
* **Log Appropriately:** Error = log, expected failure = don't spam logs
* **Handle at Right Level:** Catch where you can meaningfully handle
* **Clean Up Resources:** Use try-finally, context managers, defer
* **Don't Swallow Errors:** Log or re-throw, don't silently ignore
* **Type-Safe Errors:** Use typed errors when possible

## Common Pitfalls
* Catching Too Broadly: `except Exception` hides bugs
* Empty Catch Blocks: Silently swallowing errors
* Logging and Re-throwing: Creates duplicate log entries
* Not Cleaning Up: Forgetting to close files, connections
* Poor Error Messages: "Error occurred" is not helpful
* Returning Error Codes: Use exceptions or Result types
* Ignoring Async Errors: Unhandled promise rejections

## Resources
*(Note: These files can be created in the `resources` directory as needed.)*
- `references/exception-hierarchy-design.md`: Designing error class hierarchies
- `references/error-recovery-strategies.md`: Recovery patterns for different scenarios
- `references/async-error-handling.md`: Handling errors in concurrent code
- `assets/error-handling-checklist.md`: Review checklist for error handling
- `assets/error-message-guide.md`: Writing helpful error messages
- `scripts/error-analyzer.py`: Analyze error patterns in logs
