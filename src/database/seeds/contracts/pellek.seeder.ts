import { NestFactory } from '@nestjs/core';
import * as winston from 'winston';
import { InternalServerErrorException } from '@nestjs/common';
import { WinstonOptionsService } from '../../../logger/winston-options.service';
import { AppModule } from '../../../app.module';
import { getContractById } from '../../../config';
import { Errors } from '../../../types/errors';
import { TokenCollectionsService } from '../../../tokenCollections/token-collections.service';
import { Network } from '../../../config/types/constants';

winston.configure({ transports: WinstonOptionsService.defaultLoggerTransports() });

process.on('unhandledRejection', (reason) => {
    winston.error(`Error on contract seed (unhandledRejection):`, reason);
});

process.on('uncaughtException', (reason) => {
    winston.error(`Error on contract seed (uncaughtException):`, reason);
});

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const contract = getContractById('0xE3ea3eafE3fc255f3Ebc5b6a2b3345E59e3f2C78');

    if (!contract) {
        throw new InternalServerErrorException(Errors.CONFIG_CONTRACT_NOT_FOUND);
    }

    await app.get(TokenCollectionsService).syncContract(
        Network.ETHEREUM,
        contract.contractId,
        contract.contractCreator,
        contract.contractName,
        contract.version
    );

    await app.close();
}

bootstrap().catch(reason => {
    console.log(`Error on contract seed:`, reason);
    process.exit(1);
});
