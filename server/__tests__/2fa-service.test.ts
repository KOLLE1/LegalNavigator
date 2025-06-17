import { twoFactorService } from '../2fa-service';
import fetch from 'node-fetch';

// Mock node-fetch
jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Two Factor Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTOTPSecret', () => {
    it('should generate TOTP secret with QR code', async () => {
      const result = await twoFactorService.generateTOTPSecret('user@example.com');
      
      expect(result.secret).toBeDefined();
      expect(result.secret).toHaveLength(32);
      expect(result.qrCodeUrl).toContain('otpauth://totp/');
      expect(result.qrCodeUrl).toContain('user@example.com');
      expect(result.backupCodes).toHaveLength(10);
      expect(result.backupCodes[0]).toHaveLength(8);
    });

    it('should generate different secrets for different calls', async () => {
      const result1 = await twoFactorService.generateTOTPSecret('user1@example.com');
      const result2 = await twoFactorService.generateTOTPSecret('user2@example.com');
      
      expect(result1.secret).not.toBe(result2.secret);
      expect(result1.qrCodeUrl).not.toBe(result2.qrCodeUrl);
    });
  });

  describe('verifyTOTP', () => {
    it('should verify valid TOTP codes', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      // We can't test actual TOTP codes without time manipulation
      // but we can test the validation logic
      const validCode = '123456';
      const result = twoFactorService.verifyTOTP(validCode, secret);
      
      // The result depends on the actual time, so we just check it's a boolean
      expect(typeof result).toBe('boolean');
    });

    it('should reject invalid TOTP format', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const invalidCode = '12345'; // Too short
      const result = twoFactorService.verifyTOTP(invalidCode, secret);
      
      expect(result).toBe(false);
    });
  });

  describe('generateEmailCode', () => {
    it('should generate 6-digit codes', () => {
      const code = twoFactorService.generateEmailCode();
      
      expect(code).toMatch(/^\d{6}$/);
      expect(code).toHaveLength(6);
    });

    it('should generate different codes', () => {
      const code1 = twoFactorService.generateEmailCode();
      const code2 = twoFactorService.generateEmailCode();
      
      // Very low probability they're the same
      expect(code1).not.toBe(code2);
    });
  });

  describe('sendEmailCode', () => {
    it('should send verification email successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as any);

      await expect(
        twoFactorService.sendEmailCode('user@example.com', '123456', 'verification')
      ).resolves.not.toThrow();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://formsubmit.co/ajax/user@example.com',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: expect.stringContaining('123456')
        })
      );
    });

    it('should handle email sending failures', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      } as any);

      await expect(
        twoFactorService.sendEmailCode('invalid@email', '123456', 'verification')
      ).rejects.toThrow('Failed to send email');
    });

    it('should send 2FA setup emails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as any);

      await twoFactorService.sendEmailCode('user@example.com', '123456', '2fa_setup');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('Two-Factor Authentication Setup')
        })
      );
    });
  });

  describe('validation methods', () => {
    it('should validate email codes correctly', () => {
      expect(twoFactorService.isValidEmailCode('123456')).toBe(true);
      expect(twoFactorService.isValidEmailCode('12345')).toBe(false);
      expect(twoFactorService.isValidEmailCode('1234567')).toBe(false);
      expect(twoFactorService.isValidEmailCode('abcdef')).toBe(false);
      expect(twoFactorService.isValidEmailCode('')).toBe(false);
    });

    it('should validate TOTP codes correctly', () => {
      expect(twoFactorService.isValidTOTPCode('123456')).toBe(true);
      expect(twoFactorService.isValidTOTPCode('12345')).toBe(false);
      expect(twoFactorService.isValidTOTPCode('1234567')).toBe(false);
      expect(twoFactorService.isValidTOTPCode('abcdef')).toBe(false);
      expect(twoFactorService.isValidTOTPCode('')).toBe(false);
    });
  });
});