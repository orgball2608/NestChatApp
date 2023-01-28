import { Test, TestingModule } from '@nestjs/testing';
import { GroupRecipientsService } from '../services/group-recipients.service';

describe('GroupRecipientsService', () => {
    let service: GroupRecipientsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GroupRecipientsService],
        }).compile();

        service = module.get<GroupRecipientsService>(GroupRecipientsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
