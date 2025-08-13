export interface OmsResponseDto {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface CidResponseDto {
  code: string;
  title: string;
  description?: string;
}
