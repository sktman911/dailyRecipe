export interface RequestParams {
    skip: number,
    take: number,
    sort: Sort[],
    filter: Filter[],
    lastDocId?: string
}

interface Sort{
    desc: boolean,
    selector: string,
}

interface Filter{
    field: string,
    operator: string,
    value: string
}