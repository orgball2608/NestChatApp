import { Test, TestingModule } from '@nestjs/testing';
import { GroupMessagesController } from '../controllers/group-messages.controller';

describe('GroupMessagesController', () => {
    let controller: GroupMessagesController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GroupMessagesController],
        }).compile();

        controller = module.get<GroupMessagesController>(GroupMessagesController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
