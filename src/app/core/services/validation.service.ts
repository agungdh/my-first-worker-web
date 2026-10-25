import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map, type Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { ValidationResponse, ValidationSample } from '../models/api.models';

@Service()
export class ValidationService {
  private readonly http = inject(HttpClient);

  validate(input: ValidationSample): Observable<ValidationSample> {
    return this.http
      .post<ValidationResponse>(`${environment.apiBaseUrl}/testing/validation`, input)
      .pipe(map((response) => response.data));
  }
}
