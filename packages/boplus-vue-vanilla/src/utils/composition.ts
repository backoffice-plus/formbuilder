import {inject, provide} from 'vue';


export interface NestedInfo {
    level: number;
    parentElement?: 'array' | 'object';
}

export const useNested = (element: false | 'array' | 'object'): NestedInfo => {
    const nestedInfo = inject<NestedInfo>('jsonforms.nestedInfo', {level: 0});
    if (element) {
        provide('jsonforms.nestedInfo', {
            level: nestedInfo.level + 1,
            parentElement: element,
        });
    }
    return nestedInfo;
};
