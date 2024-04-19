import { CqrsModule } from '@nestjs/cqrs';
import { Logger, Module, Provider } from '@nestjs/common';
import { EventGateway } from '@modules/event/gateway/events.gateway';

const httpControllers = [];

const messageControllers = [];

const gateways = [EventGateway];

const cliControllers: Provider[] = [];

const commandHandlers: Provider[] = [];

const queryHandlers: Provider[] = [];

const mappers: Provider[] = [];

const repositories: Provider[] = [];

@Module({
  imports: [CqrsModule],
  controllers: [...httpControllers, ...messageControllers],
  providers: [
    Logger,
    ...gateways,
    ...cliControllers,
    ...repositories,
    ...commandHandlers,
    ...queryHandlers,
    ...mappers,
  ],
  exports: [...gateways],
})
export class EventModule {}
