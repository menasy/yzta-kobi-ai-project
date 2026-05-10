/**
 * ApiError — Standart hata sınıfı
 *
 * Backend'in { statusCode, key, message, errors } formatını temsil eder.
 * try/catch bloklarında instanceof ApiError ile yakalanır.
 */
export class ApiError extends Error {
  public readonly key: string;
  public readonly statusCode: number;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    key: string,
    statusCode: number,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.key = key;
    this.statusCode = statusCode;
    this.errors = errors;

    // Prototype chain fix for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isForbidden(): boolean {
    return this.statusCode === 403;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  get isValidationError(): boolean {
    return this.statusCode === 422 || this.statusCode === 400;
  }
}
