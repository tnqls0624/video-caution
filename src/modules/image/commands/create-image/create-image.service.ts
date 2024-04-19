import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Ok, Result } from 'oxide.ts';
import { Inject } from '@nestjs/common';
import { IMAGE_REPOSITORY } from '@modules/image/image.di-tokens';
import { ImageRepositoryPort } from '@modules/image/database/image.repository.port';
import { CreateImageCommand } from '@modules/image/commands/create-image/create-image.command';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as crypto from 'crypto';
import { v4 as uuid } from 'uuid';
import mime from 'mime-types';
import path from 'path';
import { ImageEntity } from '@modules/image/domain/image.entity';
import { ImageTagProcessService } from '@modules/image/commands/create-image/image-tag-process.service';

@CommandHandler(CreateImageCommand)
export class CreateImageService implements ICommandHandler {
  private s3: S3Client;
  private BUCKET_NAME = 'image-resize-bk';
  constructor(
    @Inject(IMAGE_REPOSITORY)
    protected readonly imageRepo: ImageRepositoryPort,
    protected readonly imageTag: ImageTagProcessService,
  ) {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
    });
  }

  async execute(command: CreateImageCommand): Promise<Result<any, Error>> {
    try {
      const { filename, buffer } = command;
      const image = await this.saveImage(filename, buffer);
      if (image.exist) {
        return Ok({
          tags: image.image.tags,
          src: image.image.src,
        });
      }
      const koreanTags = await this.imageTag.classifyImage(buffer);
      const imageEntity = ImageEntity.create({
        src: image.image.src,
        hash: image.image.hash,
        tags: koreanTags.join(',') || '',
      });

      await this.imageRepo.transaction(async () =>
        this.imageRepo.insert(imageEntity),
      );
      return Ok({
        tags: koreanTags,
        src: image.image.src,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async saveImage(
    filename: string,
    buffer: Buffer,
  ): Promise<{
    image: { src: string; hash: string; tags: string };
    exist: boolean;
  }> {
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const existImage = await this.imageRepo.findByHash(hash);
    let src = '';
    if (existImage) {
      return { image: existImage, exist: true };
    } else {
      const extname = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      if (extname === '.jpeg' || extname === '.jpg') {
        contentType = 'image/jpeg';
      } else if (extname === '.png') {
        contentType = 'image/png';
      }
      const key = `${uuid()}.${mime.extension(contentType)}`;
      src = await this.uploadToS3(buffer, `test/${key}`, contentType);
    }
    return {
      image: { hash, src, tags: '' },
      exist: false,
    };
  }

  async uploadToS3(
    buffer: Buffer,
    filename: string,
    content_type: string,
  ): Promise<string> {
    const uploadParams = {
      Bucket: this.BUCKET_NAME,
      AccelerateConfiguration: {
        Status: 'Enabled',
      },
      Key: filename,
      Body: buffer,
      ContentLength: buffer.length,
      ContentType: content_type,
    };
    await this.s3.send(new PutObjectCommand(uploadParams));
    return `https://dq3eswfeko05a.cloudfront.net/${filename}`;
  }
}
