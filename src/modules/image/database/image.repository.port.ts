import { PaginatedQueryParams, RepositoryPort } from '@libs/ddd';
import { Prisma } from '@prisma/client';
import { ImageEntity } from '@modules/image/domain/image.entity';

export interface ImageRepositoryPort extends RepositoryPort {
  insert(entity: ImageEntity): Promise<Prisma.BatchPayload | undefined>;
  // updateAddress(entity: UserEntity): Promise<boolean>;
  // delete(entity: UserEntity): Promise<boolean>;
  // findOneById(id: string): Promise<Option<UserEntity>>;
}
