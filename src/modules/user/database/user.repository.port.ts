import { PaginatedQueryParams, RepositoryPort } from '@libs/ddd';
import { Prisma } from '@prisma/client';
import { Option } from 'oxide.ts';
import { UserEntity } from '@modules/user/domain/user.entity';

export interface FindUsersParams extends PaginatedQueryParams {
  readonly country?: string;
  readonly postalCode?: string;
  readonly street?: string;
}

export interface UserRepositoryPort extends RepositoryPort {
  insert(entity: UserEntity): Promise<Prisma.BatchPayload | undefined>;
  updateAddress(entity: UserEntity): Promise<boolean>;
  delete(entity: UserEntity): Promise<boolean>;
  findOneById(id: string): Promise<Option<UserEntity>>;
}
