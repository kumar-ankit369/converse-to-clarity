const jwt = require('jsonwebtoken');

class JWTConfig {
  static getJWTSecret() {
    return process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  }

  static getRefreshSecret() {
    return process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
  }

  static getTokenOptions() {
    return {
      accessToken: {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        issuer: process.env.JWT_ISSUER || 'collabproject',
        audience: process.env.JWT_AUDIENCE || 'collabproject-users'
      },
      refreshToken: {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: process.env.JWT_ISSUER || 'collabproject',
        audience: process.env.JWT_AUDIENCE || 'collabproject-users'
      }
    };
  }

  static generateAccessToken(payload) {
    const options = this.getTokenOptions().accessToken;
    return jwt.sign(payload, this.getJWTSecret(), options);
  }

  static generateRefreshToken(payload) {
    const options = this.getTokenOptions().refreshToken;
    return jwt.sign(payload, this.getRefreshSecret(), options);
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.getJWTSecret());
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.getRefreshSecret());
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static decodeToken(token) {
    return jwt.decode(token, { complete: true });
  }

  static getTokenExpiry(token) {
    const decoded = this.decodeToken(token);
    return decoded?.payload?.exp ? new Date(decoded.payload.exp * 1000) : null;
  }

  static isTokenExpired(token) {
    const expiry = this.getTokenExpiry(token);
    return expiry ? expiry < new Date() : true;
  }

  static generateTokenPair(payload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }
}

module.exports = JWTConfig;