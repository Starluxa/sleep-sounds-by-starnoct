import { toast } from 'sonner';

export enum ErrorType {
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  NETWORK = 'network',
  PAYMENT = 'payment',
  UNKNOWN = 'unknown',
}

export class ApplicationError extends Error {
  type: ErrorType;
  statusCode: number;

  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, statusCode: number = 500) {
    super(message);
    this.name = 'ApplicationError';
    this.type = type;
    this.statusCode = statusCode;
  }
}

export function handleError(
  error: unknown,
  fallbackMessage: string = 'An error occurred',
  context?: string
): { message: string; type: ErrorType } {
  console.error(`Error in ${context}:`, error);

  let message = fallbackMessage;
  let type = ErrorType.UNKNOWN;

  if (error instanceof ApplicationError) {
    message = error.message;
    type = error.type;
  } else if (error instanceof Error) {
    message = error.message || fallbackMessage;
  } else if (typeof error === 'string') {
    message = error;
  }

  toast.error(message);

  return { message, type };
}

export function handleSuccess(message: string) {
  toast.success(message);
}