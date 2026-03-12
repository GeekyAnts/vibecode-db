export class PostgrestError extends Error {
  details: string;
  hint: string;
  code: string;

  constructor(message: string, details = '', hint = '', code = '') {
    super(message);
    this.name = 'PostgrestError';
    this.details = details;
    this.hint = hint;
    this.code = code;
  }
}

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export class StorageError extends Error {
  statusCode: string;

  constructor(message: string, statusCode = '400') {
    super(message);
    this.name = 'StorageError';
    this.statusCode = statusCode;
  }
}

export class FunctionsError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'FunctionsError';
    this.status = status;
  }
}
