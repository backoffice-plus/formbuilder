
export const defaultStyles: BopStyles = {
    categorization: {
        root: 'categorization',
        category: 'tabs',
        selected: 'selected',
        panel: 'panel',
    },
    oneOf: {
        root: 'oneof',
        select: 'oneof-select',
    },
    objectAddProps: {
        root: 'object-addprops-root',
        toolbar: 'object-addprops-toolbar',
        items: 'object-addprops-items',
    },
    enumArray: {
        root: 'enum-array',
        item: 'enum-array-item',
    },
};

export interface BopStyles {
    categorization: {
        root?: string;
        category?: string;
        selected?: string;
        panel?: string;
    },
    oneOf: {
        root?: string;
        select?: string;
    },
    objectAddProps: {
        root?: string;
        toolbar?: string;
        items?: string;
    },
    enumArray: {
        root?: string;
        item?: string;
        label?: string;
    },
}
