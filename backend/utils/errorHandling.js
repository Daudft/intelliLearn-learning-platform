/**
 * Centralized error handling and validation utilities
 */

/**
 * Validate required fields in request body
 */
function validateRequired(data, requiredFields) {
  const missing = [];
  requiredFields.forEach(field => {
    if (!data[field]) {
      missing.push(field);
    }
  });
  return missing;
}

/**
 * Validate enum values
 */
function validateEnum(value, allowedValues, fieldName) {
  if (!allowedValues.includes(value)) {
    return `Invalid ${fieldName}. Must be one of: ${allowedValues.join(', ')}`;
  }
  return null;
}

/**
 * Validate MongoDB ObjectId
 */
function validateMongoId(id, fieldName = 'ID') {
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return `Invalid ${fieldName} format`;
  }
  return null;
}

/**
 * API Response formatter
 */
function successResponse(res, data, statusCode = 200, message = 'Success') {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function errorResponse(res, message, statusCode = 500, error = null) {
  console.error(`[${statusCode}] ${message}`, error);
  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && error && { error: error.message }),
  });
}

/**
 * Wrap async route handlers to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Validate proficiency level
 */
function validateProficiencyLevel(level) {
  const valid = ['Beginner', 'Intermediate', 'Advanced'];
  if (!valid.includes(level)) {
    return `Invalid proficiency level. Must be one of: ${valid.join(', ')}`;
  }
  return null;
}

/**
 * Validate language
 */
function validateLanguage(language) {
  const valid = ['python', 'java', 'c'];
  if (!valid.includes(language?.toLowerCase())) {
    return `Invalid language. Must be one of: ${valid.join(', ')}`;
  }
  return null;
}

/**
 * Validate difficulty level
 */
function validateDifficulty(difficulty) {
  const valid = ['easy', 'medium', 'hard'];
  if (!valid.includes(difficulty?.toLowerCase())) {
    return `Invalid difficulty. Must be one of: ${valid.join(', ')}`;
  }
  return null;
}

/**
 * Log operation with context
 */
function logOperation(operation, context = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ℹ️ ${operation}`, context);
}

/**
 * Log error with context
 */
function logError(operation, error, context = {}) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ ${operation}`, {
    error: error?.message,
    stack: error?.stack?.split('\n')[0],
    ...context,
  });
}

module.exports = {
  validateRequired,
  validateEnum,
  validateMongoId,
  validateProficiencyLevel,
  validateLanguage,
  validateDifficulty,
  successResponse,
  errorResponse,
  asyncHandler,
  logOperation,
  logError,
};
