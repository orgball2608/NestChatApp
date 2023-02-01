import { Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { StorageController } from './storage.controller';
import { Services } from '../utils/constants';
import { SpacesServiceProvider } from './services';

@Module({
    controllers: [StorageController],
    providers: [
        SpacesServiceProvider,
        {
            provide: Services.IMAGE_UPLOAD_SERVICE,
            useClass: StorageService,
        },
    ],
    exports: [
        SpacesServiceProvider,
        {
            provide: Services.IMAGE_UPLOAD_SERVICE,
            useClass: StorageService,
        },
    ],
})
export class StorageModule {}
