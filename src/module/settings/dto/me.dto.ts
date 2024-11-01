import { IsOptional, IsString } from 'class-validator';

export class UpdateMe {
  @IsString()
  @IsOptional()
  profilePhoto?: string;

  @IsString()
  @IsOptional()
  username?: string;
}
