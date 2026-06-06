import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';

/**
 * Utilidad de cifrado AES-256-CBC para el frontend.
 *
 * Flujo completo para endpoints críticos:
 *  1. El DTO se serializa a JSON.
 *  2. El JSON se cifra con AES-256-CBC (Key e IV del environment).
 *  3. El resultado Base64 se envuelve en { "data": "<base64>" }.
 *  4. El backend (DecryptionMiddleware) recibe el wrapper,
 *     descifra el Base64 y reemplaza el body antes de que
 *     llegue al controller — que siempre recibe el DTO limpio.
 *
 * Cuando `environment.encryption.enabled` es false (desarrollo),
 * `encryptBody` devuelve el DTO original sin envolver,
 * lo que permite usar Swagger directamente con JSON plano.
 */
export class EncryptionUtil {

  private static get cfg() { return environment.encryption; }

  // ─── Método principal ─────────────────────────────────────────────────────

  /**
   * Serializa el DTO a JSON, lo cifra con AES y lo envuelve en `{ data: "..." }`.
   * Si el cifrado está deshabilitado, devuelve el DTO original sin modificar.
   *
   * @param dto Objeto a cifrar.
   * @returns `{ data: "<Base64>" }` si cifrado habilitado, o el DTO original.
   */
  static encryptBody<T extends object>(dto: T): { data: string } | T {
    if (!this.cfg.enabled) return dto;
    const json      = JSON.stringify(dto);
    const encrypted = this.encrypt(json);
    return { data: encrypted };
  }

  // ─── Cifrado / descifrado de strings ─────────────────────────────────────

  /**
   * Cifra un string con AES-256-CBC y devuelve el resultado en Base64.
   */
  static encrypt(plainText: string): string {
    if (!this.cfg.enabled || !plainText) return plainText;

    const key = CryptoJS.enc.Utf8.parse(this.cfg.key);
    const iv  = CryptoJS.enc.Utf8.parse(this.cfg.iv);

    return CryptoJS.AES.encrypt(plainText, key, {
      iv,
      mode:    CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
  }

  /**
   * Descifra un string Base64 cifrado con AES-256-CBC.
   */
  static decrypt(cipherText: string): string {
    if (!this.cfg.enabled || !cipherText) return cipherText;

    const key = CryptoJS.enc.Utf8.parse(this.cfg.key);
    const iv  = CryptoJS.enc.Utf8.parse(this.cfg.iv);

    return CryptoJS.AES.decrypt(cipherText, key, {
      iv,
      mode:    CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
  }
}
