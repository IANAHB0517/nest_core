import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class PaginatePostDto {
  @IsNumber()
  @IsOptional()
  page: number;

  @IsNumber()
  @IsOptional()
  where__id_less_than?: number;

  // 이전 마지막 데이터의 ID
  // 이 프로퍼티에 입력된 ID보다 높은 ID 부터 값을 가져오기
  // Transformer가 String을 Number타입으로 변경해준다.
  // 굉장히 유용하지만 잘 사용 하지 않는다.
  // 그 이유는 main.ts에 있는 validation Pipe에 transformOptions을 사용 하므로써  classvalidator 어노테이션으로 타입이 지정된 경우 자동으로 쿼리스트링의 타입을 변환 해주기 때문이다.
  //   @Type(() => Number)
  @IsNumber()
  @IsOptional()
  where__id_more_than?: number;

  // 미리 정의해둔 값일 경우에만 validation이 통과되도록한다 이 예제에서는 ASC만 사용
  //   @IsIn(['ASC', 'DESC'])

  // 정렬
  // createdAt -> 생성된 시간의 내림차.오름차 순으로 정렬
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__createdAt?: 'ASC' | 'DESC' = 'ASC';

  // 몇개의 데이터를 조회할지
  @IsNumber()
  @IsOptional()
  take: number = 20;
}
