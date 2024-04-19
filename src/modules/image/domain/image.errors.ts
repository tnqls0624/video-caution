import { ExceptionBase } from '@libs/exceptions';

export class ImageNotFoundError extends ExceptionBase {
  static readonly message = 'Image not found';

  public readonly code = 'IMAGE.NOT_FOUND';

  constructor(cause?: Error, metadata?: unknown) {
    super(ImageNotFoundError.message, cause, metadata);
  }
}
