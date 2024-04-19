import { AggregateRoot, AggregateID, CreateEntityProps } from '@libs/ddd';
import { CreateImageProps, ImageProps } from './image.types';
import { randomUUID } from 'crypto';
import { ImageCreatedDomainEvent } from '@modules/image/domain/events/image-created.domain-event';

export class ImageEntity extends AggregateRoot<ImageProps> {
  protected _id: AggregateID;

  constructor(createProps: CreateEntityProps<ImageProps>) {
    super(createProps);
    this._id = createProps.id;
  }

  static create(create: CreateImageProps): ImageEntity {
    const id = randomUUID();
    /* Setting a default role since we are not accepting it during creation. */
    const props: ImageProps = { ...create };
    const image = new ImageEntity({ id, props });
    /* adding "UserCreated" Domain Event that will be published
    eventually so an event handler somewhere may receive it and do an
    appropriate action. Multiple events can be added if needed. */
    image.addEvent(
      new ImageCreatedDomainEvent({
        aggregateId: id,
        src: props.src,
        hash: props.hash,
      }),
    );
    return image;
  }

  validate(): void {
    // entity business rules validation to protect it's invariant before saving entity to a database
  }
}
