import { ApiProperty } from '@nestjs/swagger';
import { ResponseBase } from '@libs/api/response.base';

export class ImageResponseDto extends ResponseBase {
  @ApiProperty({
    example: 'https://test.com/asdn3/23121',
    description: 'image url',
  })
  src: string;

  @ApiProperty({
    example: 'dnjsj213njk3n21jkn321',
    description: 'image hash',
  })
  hash: string;
}
