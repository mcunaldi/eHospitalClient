export class ResultModel<T>{
    data?: T;
    errorMessages?: string[];
    isSuccessFull: boolean = true;
    statusCode: number = 200;
}