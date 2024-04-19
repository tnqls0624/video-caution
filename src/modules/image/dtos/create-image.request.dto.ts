import { ApiProperty } from '@nestjs/swagger';

export class CreateImageRequestDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: '이미지 파일',
  })
  file: Buffer;
}
