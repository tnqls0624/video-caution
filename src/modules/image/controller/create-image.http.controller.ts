import {
  Body,
  ConflictException as ConflictHttpException,
  Controller,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { routesV1 } from '@config/app.routes';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { match, Result } from 'oxide.ts';
import { CreateImageCommand } from '@modules/image/commands/create-image/create-image.command';
import { CreateImageRequestDto } from '../dtos/create-image.request.dto';
import { UserAlreadyExistsError } from '@modules/user/domain/user.errors';
import { IdResponse } from '@libs/api/id.response.dto';
import { AggregateID } from '@libs/ddd';
import { ApiErrorResponse } from '@libs/api/api-error.response';
import { FastifyRequest } from 'fastify';
import { ResponseBase } from '@libs/api/response.base';

@ApiTags('images')
@Controller(routesV1.version)
export class CreateImageHttpController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Create a image' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: IdResponse,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: UserAlreadyExistsError.message,
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ApiErrorResponse,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '이미지 파일',
    type: CreateImageRequestDto,
  })
  @Post(routesV1.image.root)
  async create(@Req() req: FastifyRequest): Promise<any> {
    const data = await req.file();
    const buffer = (await data?.toBuffer()) as Buffer;
    const command = new CreateImageCommand({
      filename: data?.filename as string,
      buffer: buffer as Buffer,
    });
    const result: Result<AggregateID, UserAlreadyExistsError> =
      await this.commandBus.execute(command);
    console.log(result);
    // Deciding what to do with a Result (similar to Rust matching)
    // if Ok we return a response with an id
    // if Error decide what to do with it depending on its type
    return match(result, {
      Ok: (props: any) => {
        return {
          // ...new IdResponse(id),
          tags: props.tags,
          url: props.url,
        };
      },
      Err: (error: Error) => {
        if (error instanceof UserAlreadyExistsError)
          throw new ConflictHttpException(error.message);
        throw error;
      },
    });
  }
}
