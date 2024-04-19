import { DomainEvent, DomainEventProps } from '@libs/ddd';

export class ImageCreatedDomainEvent extends DomainEvent {
  readonly src: string;

  readonly hash: string;

  constructor(props: DomainEventProps<ImageCreatedDomainEvent>) {
    super(props);
    this.src = props.src;
    this.hash = props.hash;
  }
}
