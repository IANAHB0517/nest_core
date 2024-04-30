import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class PaginatePostDto {
  // 이전 마지막 데이터의 ID
  // 이 프로퍼티에 입력된 ID보다 높은 ID 부터 값을 가져오기
  @IsNumber()
  @IsOptional()
  where__id_more_than?: number;

  // 미리 정의해둔 값일 경우에만 validation이 통과되도록한다 이 예제에서는 ASC만 사용
  //   @IsIn(['ASC', 'DESC'])

  // 정렬
  // createdAt -> 생성된 시간의 내림차.오름차 순으로 정렬
  @IsIn(['ASC'])
  @IsOptional()
  order__createdAt?: 'ASC';

  // 몇개의 데이터를 조회할지
  @IsNumber()
  @IsOptional()
  take: number = 20;
}
