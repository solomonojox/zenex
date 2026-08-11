import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

/** Global so any module can send transactional email without extra imports. */
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
