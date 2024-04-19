import { Mapper } from '@libs/ddd';
import { Injectable } from '@nestjs/common';
import { ImageEntity } from '@modules/image/domain/image.entity';
import {
  ImageModel,
  imageSchema,
} from '@modules/image/database/image.repository';
import { ImageResponseDto } from '@modules/image/dtos/image.response.dto';

/**
 * Mapper constructs objects that are used in different layers:
 * Record is an object that is stored in a database,
 * Entity is an object that is used in application domain layer,
 * and a ResponseDTO is an object returned to a user (usually as json).
 */

@Injectable()
export class ImageMapper
  implements Mapper<ImageEntity, ImageModel, ImageResponseDto>
{
  toPersistence(entity: ImageEntity): ImageModel {
    const copy = entity.getProps();
    const record: ImageModel = {
      id: copy.id,
      createdAt: copy.createdAt,
      updatedAt: copy.updatedAt,
      src: copy.src,
      hash: copy.hash,
    };
    return imageSchema.parse(record);
  }

  toDomain(record: ImageModel): ImageEntity {
    return new ImageEntity({
      id: record.id,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
      props: {
        src: record.src,
        hash: record.hash,
      },
    });
  }

  toResponse(entity: ImageEntity): ImageResponseDto {
    const props = entity.getProps();
    const response = new ImageResponseDto(entity);
    response.src = props.src;
    response.hash = props.hash;
    return response;
  }

  /* ^ Data returned to the user is whitelisted to avoid leaks.
     If a new property is added, like password or a
     credit card number, it won't be returned
     unless you specifically allow this.
     (avoid blacklisting, which will return everything
      but blacklisted items, which can lead to a data leak).
  */
}
