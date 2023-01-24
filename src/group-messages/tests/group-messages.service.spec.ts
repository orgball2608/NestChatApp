import { Test, TestingModule } from '@nestjs/testing';
import { GroupMessagesService } from '../group-messages.service';

describe('GroupMessagesService', () => {
    let service: GroupMessagesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GroupMessagesService],
        }).compile();

        service = module.get<GroupMessagesService>(GroupMessagesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
