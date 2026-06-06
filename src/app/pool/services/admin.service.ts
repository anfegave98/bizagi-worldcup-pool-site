import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminDashboardDto, MatchResultCreateDto, MatchResultDto } from '../models/pool.models';
import { EncryptionUtil } from '../../shared/utils/encryption.util';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private readonly api = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  /**
   * Registra el resultado real de un partido (solo Admin).
   * El body viaja cifrado: { data: "<AES Base64>" }
   * El backend (DecryptionMiddleware) lo descifra antes de procesarlo.
   * Acción crítica e irreversible — dispara cálculo de puntos.
   */
  registerResult(matchId: number, dto: MatchResultCreateDto): Observable<MatchResultDto> {
    return this.http.post<MatchResultDto>(
      `${this.api}/matches/${matchId}/result`,
      EncryptionUtil.encryptBody(dto)   // ← body cifrado completo
    );
  }

  /**
   * Obtiene los indicadores del dashboard administrativo.
   * GET — sin body, sin cifrado.
   */
  getDashboard(): Observable<AdminDashboardDto> {
    return this.http.get<AdminDashboardDto>(`${this.api}/dashboard`);
  }
}
