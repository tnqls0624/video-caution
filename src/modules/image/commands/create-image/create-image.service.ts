import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { UserAlreadyExistsError } from '@modules/user/domain/user.errors';
import { Inject } from '@nestjs/common';
import { ConflictException } from '@libs/exceptions';
import { IMAGE_REPOSITORY } from '@modules/image/user.di-tokens';
import { ImageRepositoryPort } from '@modules/image/database/image.repository.port';
import { CreateImageCommand } from '@modules/image/commands/create-image/create-image.command';
import * as tf from '@tensorflow/tfjs-node';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { Tensor3D } from '@tensorflow/tfjs';
import {
  TRANSLATE_GENERATOR,
  TranslateGenerator,
} from '@libs/application/translate/translate.module';

@CommandHandler(CreateImageCommand)
export class CreateImageService implements ICommandHandler {
  constructor(
    @Inject(IMAGE_REPOSITORY)
    protected readonly imageRepo: ImageRepositoryPort,
    @Inject(TRANSLATE_GENERATOR)
    protected readonly translateGenerator: TranslateGenerator,
  ) {}

  async execute(
    command: CreateImageCommand,
  ): Promise<Result<any, UserAlreadyExistsError>> {
    try {
      const { filename, buffer } = command;

      const imageTensor = tf.node.decodeImage(buffer, 3);
      const model = await mobilenet.load();
      const predictions = await model.classify(imageTensor as Tensor3D);
      imageTensor.dispose();

      const relevantTags = predictions
        .filter((p) => p.probability >= 0.4)
        .map((p) => p.className);
      const koreanTags: any[] = [];
      for (const relevantTag of relevantTags) {
        const koreanTag = await this.translateGenerator.gcpTranslate(
          relevantTag,
        );
        koreanTags.push(koreanTag);
      }
      return Ok({
        tags: koreanTags,
        url: 'https://test.com/ads21',
      });

      // client.send(JSON.stringify(predictions));
      // console.log('asd');
      // const image = ImageEntity.create({
      //   src: command.src,
      //   hash: command.hash,
      // });
      // /* Wrapping operation in a transaction to make sure
      //    that all domain events are processed atomically */
      // await this.imageRepo.transaction(async () =>
      //   this.imageRepo.insert(image),
      // );
      // return Ok(image.id);
    } catch (error: any) {
      if (error instanceof ConflictException) {
        return Err(new UserAlreadyExistsError(error));
      }
      throw error;
    }
  }
}
