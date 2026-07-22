import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthUser,
} from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('threads')
  createThread(@CurrentUser() user: AuthUser, @Body() dto: CreateThreadDto) {
    return this.messagesService.getOrCreateThread(user, dto.counterpartId);
  }

  @Get('threads')
  listThreads(@CurrentUser() user: AuthUser) {
    return this.messagesService.listThreads(user);
  }

  @Get('threads/:id')
  getMessages(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.messagesService.getMessages(user, id);
  }

  @Post('threads/:id/messages')
  send(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(user, id, dto.body);
  }
}
