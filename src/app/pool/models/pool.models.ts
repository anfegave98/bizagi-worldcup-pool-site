/** Partido del mundial */
export interface MatchDto {
  id: number;
  idGroup: number;
  groupName: string;
  idHomeTeam: number;
  homeTeamName: string;
  idAwayTeam: number;
  awayTeamName: string;
  matchDate: string;
  roundName: string;
  status: 'Scheduled' | 'Finished';
  /** Goles reales del equipo local. Null si el partido aún no ha finalizado. */
  realHomeGoals: number | null;
  /** Goles reales del equipo visitante. Null si el partido aún no ha finalizado. */
  realAwayGoals: number | null;
}

/** DTO para crear o actualizar predicción */
export interface PredictionCreateDto {
  idMatch: number;
  homeGoals: number;
  awayGoals: number;
}

/** Predicción del usuario */
export interface PredictionDto {
  id: number;
  idUser: number;
  idMatch: number;
  homeTeamName: string;
  awayTeamName: string;
  homeGoals: number;
  awayGoals: number;
  realHomeGoals: number | null;
  realAwayGoals: number | null;
  points: number;
  isCalculated: boolean;
  matchStatus: 'Scheduled' | 'Finished';
  dateCreated: string;
  dateModified: string | null;
}

/** DTO para registrar resultado real (admin) */
export interface MatchResultCreateDto {
  homeGoals: number;
  awayGoals: number;
}

/** Resultado real registrado */
export interface MatchResultDto {
  id: number;
  idMatch: number;
  homeGoals: number;
  awayGoals: number;
  registeredByUserId: number;
  registeredDate: string;
}

/** Fila del leaderboard */
export interface LeaderboardItemDto {
  position: number;
  idUser: number;
  userName: string;
  fullName: string;
  totalPoints: number;
  predictionCount: number;
  exactScoreCount: number;
}

/** Entrada del historial de predicciones de un usuario */
export interface UserPredictionHistoryDto {
  idMatch: number;
  homeTeamName: string;
  awayTeamName: string;
  predictedHomeGoals: number;
  predictedAwayGoals: number;
  realHomeGoals: number | null;
  realAwayGoals: number | null;
  points: number;
  ruleApplied: 'ExactScore' | 'WinnerOrDraw' | 'Failed' | '';
  matchStatus: 'Scheduled' | 'Finished';
  matchDate: string;
}

/** Dashboard administrativo */
export interface AdminDashboardDto {
  totalUsers: number;
  totalMatches: number;
  finishedMatches: number;
  pendingMatches: number;
  totalPredictions: number;
  calculatedPredictions: number;
}