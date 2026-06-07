import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';

/**
 * Utilidad de cifrado AES-256-CBC para el frontend.
 *
 * IMPORTANTE — Compatibilidad con .NET AES:
 * CryptoJS interpreta un string como clave usando derivación EVP_BytesToKey (formato OpenSSL),
 * lo que es INCOMPATIBLE con el AES puro que usa .NET.
 * Para que ambos lados usen exactamente los mismos bytes, la Key e IV deben
 * configurarse en Base64 en el environment y decodificarse a WordArray antes
 * de pasarlos a CryptoJS. Así ambos trabajan con los mismos bytes raw.
 *
 * Configuración requerida en environment.ts:
 *   key: Base64 de 32 bytes (AES-256) — mismo valor que Encryption:Key del backend
 *   iv:  Base64 de 16 bytes (128-bit)  — mismo valor que Encryption:IV del backend
 */
export class EncryptionUtil {

  private static get cfg() { return environment.encryption; }

  // ─── Método principal: cifra un DTO completo ──────────────────────────────

  /**
   * Serializa el DTO a JSON, lo cifra con AES-256-CBC y lo envuelve en { data: "..." }.
   * Si el cifrado está deshabilitado, devuelve el DTO original sin modificar.
   */
  static encryptBody<T extends object>(dto: T): { data: string } | T {
    if (!this.cfg.enabled) return dto;
    const json      = JSON.stringify(dto);
    const encrypted = this.encrypt(json);
    return { data: encrypted };
  }

  /**
   * Cifra un string con AES-256-CBC usando Key e IV en Base64.
   * Decodifica la Key e IV de Base64 a WordArray para compatibilidad exacta con .NET.
   */
  static encrypt(plainText: string): string {
    if (!this.cfg.enabled || !plainText) return plainText;

    // Decodificar Key e IV de Base64 a WordArray (bytes raw)
    // CRÍTICO: usar CryptoJS.enc.Base64.parse() en lugar de CryptoJS.enc.Utf8.parse()
    const key = CryptoJS.enc.Base64.parse(this.cfg.key);
    const iv  = CryptoJS.enc.Base64.parse(this.cfg.iv);

    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv,
      mode:    CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString(); // Base64 estándar compatible con Convert.FromBase64String() de .NET
  }

  /**
   * Descifra un string Base64 cifrado con AES-256-CBC.
   * Decodifica la Key e IV de Base64 a WordArray para compatibilidad exacta con .NET.
   */
  static decrypt(cipherText: string): string {
    if (!this.cfg.enabled || !cipherText) return cipherText;

    // Decodificar Key e IV de Base64 a WordArray (bytes raw)
    const key = CryptoJS.enc.Base64.parse(this.cfg.key);
    const iv  = CryptoJS.enc.Base64.parse(this.cfg.iv);

    const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
      iv,
      mode:    CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
