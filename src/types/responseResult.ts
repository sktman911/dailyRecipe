export interface ResponseResult<T>{
    success: boolean,
    message?: string,
    status: number,
    data?: T
}
