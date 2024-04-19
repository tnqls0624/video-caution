import { ImageRepositoryPort } from './image.repository.port';
import { z } from 'zod';
import { SqlRepositoryBase } from '@src/libs/db/sql-repository.base';
import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, PrismaClient } from '@prisma/client';
import { RequestContextService } from '@libs/application/context/AppRequestContext';
import { PRISMA_CLIENT } from '@libs/db/prisma.di-tokens';
import { None, Option, Some } from 'oxide.ts';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ImageEntity } from '@modules/image/domain/image.entity';
import { ImageMapper } from '@modules/image/image.mapper';

/**
 * Runtime validation of user object for extra safety (in case database schema changes).
 * If you prefer to avoid performance penalty of validation, use interfaces instead.
 */
export const imageSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.preprocess((val: any) => new Date(val), z.date()),
  updatedAt: z.preprocess((val: any) => new Date(val), z.date()),
  src: z.string(),
  hash: z.string(),
  tags: z.string(),
});

export type ImageModel = z.TypeOf<typeof imageSchema>;

/**
 *  Repository is used for retrieving/saving domain entities
 * */
@Injectable()
export class ImageRepository
  extends SqlRepositoryBase<ImageEntity, ImageModel>
  implements ImageRepositoryPort
{
  protected tableName = 'images';

  protected schema = imageSchema;

  constructor(
    @Inject(PRISMA_CLIENT) prisma: PrismaClient,
    mapper: ImageMapper,
    eventEmitter: EventEmitter2,
  ) {
    super(prisma, mapper, eventEmitter, new Logger(ImageRepository.name));
  }

  async findOneById(id: string): Promise<Option<ImageEntity>> {
    const result = await this.prisma.images.findFirst({
      where: {
        id,
      },
    });
    return result ? Some(this.mapper.toDomain(result)) : None;
  }

  // async findAll(): Promise<Aggregate[]> {
  //   const query = sql.type(this.schema)`SELECT *
  //                                       FROM ${sql.identifier([
  //                                           this.tableName,
  //                                       ])}`;
  //
  //   const result = await this.pool.query(query);
  //
  //   return result.rows.map(this.mapper.toDomain);
  // }
  //
  // async findAllPaginated(
  //   params: PaginatedQueryParams,
  // ): Promise<Paginated<Aggregate>> {
  //   const query = sql.type(this.schema)`
  //       SELECT *
  //       FROM ${sql.identifier([this.tableName])} LIMIT ${params.limit}
  //       OFFSET ${params.offset}
  //   `;
  //
  //   const result = await this.pool.query(query);
  //
  //   const entities = result.rows.map(this.mapper.toDomain);
  //   return new Paginated({
  //     data: entities,
  //     count: result.rowCount,
  //     limit: params.limit,
  //     page: params.page,
  //   });
  // }

  // async insert(entity: UserEntity): Promise<UserEntity | null> {
  async insert(entity: ImageEntity): Promise<Prisma.BatchPayload | undefined> {
    try {
      this.logger.debug(
        `[${RequestContextService.getRequestId()}] creating entities ${
          entity.id
        } from ${this.tableName}`,
      );

      const tx = RequestContextService.getTransactionConnection();
      const entities = Array.isArray(entity) ? entity : [entity];
      const records = entities.map(this.mapper.toPersistence);
      return await tx?.images.createMany({
        data: records,
      });
    } catch (error: any) {
      if (error instanceof PrismaClientKnownRequestError) {
        this.logger.debug(
          `[${RequestContextService.getRequestId()}] ${error.message}`,
        );
        throw new ConflictException(
          'Record already exists',
          `${(error as any).meta.modelName} model, ${
            (error as any).meta.target
          } request error`,
        );
      }
      throw error;
    }
  }

  async findByHash(hash: string): Promise<ImageModel> {
    return (await this.prisma.images.findFirst({
      where: {
        hash,
      },
    })) as ImageModel;
  }
}
