import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PredictionCreateDto, PredictionDto } from '../models/pool.models';
import { EncryptionUtil } from '../../shared/utils/encryption.util';

@Injectable({ providedIn: 'root' })
export class PredictionService {

  private readonly api = `${environment.apiUrl}/predictions`;

  constructor(private http: HttpClient) {}

  /**
   * Crea o actualiza la predicción del usuario autenticado.
   * El body viaja cifrado: { data: "<AES Base64>" }
   * El backend (DecryptionMiddleware) lo descifra antes de procesarlo.
   */
  createOrUpdate(dto: PredictionCreateDto): Observable<PredictionDto> {
    return this.http.post<PredictionDto>(
      this.api,
      EncryptionUtil.encryptBody(dto)   // ← body cifrado completo
    );
  }

  /**
   * Obtiene todas las predicciones del usuario autenticado.
   * GET — sin body, sin cifrado.
   */
  getMine(): Observable<PredictionDto[]> {
    return this.http.get<PredictionDto[]>(`${this.api}/mine`);
  }
}
