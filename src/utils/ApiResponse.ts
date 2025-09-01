export class ApiResponse<T> {
  success = true as const;
  constructor(public data: T, public message = "ok") {}
}
