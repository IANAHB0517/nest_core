import { ValidationArguments } from 'class-validator';

export const emailValidationMessage = (args: ValidationArguments) => {
  return `${args.property}는 email 형식으로 입력해야 합니다.`;
};
