import { Command, CommandProps } from '@libs/ddd';

export class CreateImageCommand extends Command {
  readonly filename: string;

  readonly buffer: Buffer;

  constructor(props: CommandProps<CreateImageCommand>) {
    super(props);
    this.filename = props.filename;
    this.buffer = props.buffer;
  }
}
