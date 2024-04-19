import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateImageHttpController } from '@modules/image/controller/create-image.http.controller';
import { CreateImageService } from '@modules/image/commands/create-image/create-image.service';
import { IMAGE_REPOSITORY } from '@modules/image/image.di-tokens';
import { ImageRepository } from '@modules/image/database/image.repository';
import { ImageMapper } from '@modules/image/image.mapper';
import { EventModule } from '@modules/event/event.module';
import { TranslateModule } from '@modules/translate/translate.module';
import { ImageTagProcessService } from '@modules/image/commands/create-image/image-tag-process.service';

const httpControllers = [CreateImageHttpController];

const messageControllers = [];

const cliControllers: Provider[] = [];

const commandHandlers: Provider[] = [
  CreateImageService,
  ImageTagProcessService,
];

const queryHandlers: Provider[] = [];

const mappers: Provider[] = [ImageMapper];

const repositories: Provider[] = [
  { provide: IMAGE_REPOSITORY, useClass: ImageRepository },
];

@Module({
  imports: [CqrsModule, EventModule, TranslateModule],
  controllers: [...httpControllers, ...messageControllers],
  providers: [
    Logger,
    ...cliControllers,
    ...repositories,
    ...commandHandlers,
    ...queryHandlers,
    ...mappers,
  ],
})
export class ImageModule {}
