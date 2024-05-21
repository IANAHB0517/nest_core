import { IsNumber } from 'class-validator';

export class CreateChatDto {
  //each:true 옵션은 리스트로 들어오는 값들이 모두 컬럼의 어노테이션에 충족하는지 확인 하도록하는 옵션
  @IsNumber({}, { each: true })
  userIds: number[];
}
