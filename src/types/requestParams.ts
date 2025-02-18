export interface RequestParams {
    skip: number,
    take: number,
    sort: Sort[],
    filter: Filter[],
    lastDocId?: string
}

export interface Sort{
    desc: boolean,
    selector: string,
}

export interface Filter{
    field: string,
    operator: string ,
    value: object,     
}
