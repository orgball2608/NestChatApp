import { Test, TestingModule } from '@nestjs/testing';
import { GroupRecipientsController } from '../controllers/group-recipients.controller';

describe('GroupRecipientsController', () => {
    let controller: GroupRecipientsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GroupRecipientsController],
        }).compile();

        controller = module.get<GroupRecipientsController>(GroupRecipientsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
