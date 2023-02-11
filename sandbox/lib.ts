export const getUrl = () : URL => {
    return new URL('http://domain.com' + window.location.hash.slice(1))
}
export const getExampleFromUrl = () : string|null => {
    return getUrl().searchParams.get('example');
}
