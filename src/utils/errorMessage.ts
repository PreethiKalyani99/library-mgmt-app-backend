export function throwError(name: string, field: string, value: number | string){
    throw new Error(`${name} with ${field} ${value} not found`)
}