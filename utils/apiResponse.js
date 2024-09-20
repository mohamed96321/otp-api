class ApiResponse {
  constructor(statusCode, data = null, message = null) {
    this.statusCode = statusCode;
    this.data = data !== undefined ? data : null;
    this.message = message || (statusCode < 400 ? 'Success' : 'Error');
    this.success = statusCode < 400;
  }

  // Add a method to handle error responses for better clarity
  static error(statusCode, message = 'Error', data = null) {
    return new ApiResponse(statusCode, data, message);
  }
}

module.exports = ApiResponse;
