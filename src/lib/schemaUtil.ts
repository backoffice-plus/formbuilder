import {ToolInterface} from "./models";

export const findAllScopablePaths = (baseTool:ToolInterface, parentPath='#') => {

    const currentProperties = baseTool?.edge.childs.map(item => {
        //const currentPath = (parentPath ? parentPath+'.' : '')+ item.propertyName;
        const currentPath = (parentPath ? parentPath+'/properties/' : '')+ item.propertyName;

        if('object' === item.schema.type) {
            return [
                currentPath,
                ...findAllScopablePaths(item, currentPath),
            ].flat()
        }
        return [currentPath]
    });

    return currentProperties.flat()
}
