import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { routesV1 } from '@config/app.routes';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Result } from 'oxide.ts';
import { Paginated } from '@libs/ddd';
import { UserPaginatedResponseDto } from '../dtos/user.paginated.response.dto';
import { PaginatedQueryRequestDto } from '@libs/api/paginated-query.request.dto';
import { UserModel } from '../database/user.repository';
import { ResponseBase } from '@libs/api/response.base';
import { FindUsersQuery } from '@modules/user/queries/find-users/find-users.query';

@ApiTags('users')
@Controller(routesV1.version)
export class FindUsersHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(routesV1.user.root)
  @ApiOperation({ summary: 'Find users' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserPaginatedResponseDto,
  })
  async findUsers(
    @Query() queryParams: PaginatedQueryRequestDto,
  ): Promise<UserPaginatedResponseDto> {
    const query = new FindUsersQuery({
      limit: queryParams?.limit,
      page: queryParams?.page,
    });
    const result: Result<
      Paginated<UserModel>,
      Error
    > = await this.queryBus.execute(query);
    const paginated = result.unwrap();
    // Whitelisting returned properties
    return new UserPaginatedResponseDto({
      ...paginated,
      data: paginated.data.map((user) => ({
        ...new ResponseBase(user),
        email: user.email,
        country: user.country,
        street: user.street,
        postalCode: user.postalCode,
      })),
    });
  }
}
