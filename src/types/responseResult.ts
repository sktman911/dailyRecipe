export interface ResponseResult<T>{
    success: Boolean,
    message : String,
    status: number,
    data: T
}
