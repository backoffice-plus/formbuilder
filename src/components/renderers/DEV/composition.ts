import merge from 'lodash/merge';
import { computed, inject, provide } from 'vue';
import type {JsonFormsSubStates, UISchemaElement} from '@jsonforms/core';
import type Ajv from 'ajv';
import {defaultStyles, Styles} from "@jsonforms/vue-vanilla";
export interface NestedInfo {
  level: number;
  parentElement?: 'array' | 'object';
}


export const useControlAppliedOptions = <I extends { control: any }>(
  input: I
) => {
  return computed(() =>
    merge(
      {},
      JSON.parse(JSON.stringify(input.control.value.config)), //deepmerge
      JSON.parse(JSON.stringify(input.control.value.uischema?.options ?? [])) //deepmerge
    )
  );
};


export const useNested = (element: false | 'array' | 'object'): NestedInfo => {
  const nestedInfo = inject<NestedInfo>('jsonforms.nestedInfo', { level: 0 });
  if (element) {
    provide('jsonforms.nestedInfo', {
      level: nestedInfo.level + 1,
      parentElement: element,
    });
  }
  return nestedInfo;
};


export const useAjv = () => {
  const jsonforms = inject<JsonFormsSubStates>('jsonforms');

  if (!jsonforms) {
    throw new Error(
        "'jsonforms' couldn't be injected. Are you within JSON Forms?"
    );
  }

  // should always exist
  return jsonforms.core?.ajv as Ajv;
};

export const useTranslator = () => {
  const jsonforms = inject<JsonFormsSubStates>('jsonforms');

  if (!jsonforms) {
    throw new Error(
        "'jsonforms couldn't be injected. Are you within JSON Forms?"
    );
  }

  if (!jsonforms.i18n || !jsonforms.i18n.translate) {
    throw new Error(
        "'jsonforms i18n couldn't be injected. Are you within JSON Forms?"
    );
  }

  const translate = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return jsonforms.i18n!.translate!;
  });

  return translate;
};

const createEmptyStyles = (): Styles => ({
  control: {},
  verticalLayout: {},
  horizontalLayout: {},
  group: {},
  arrayList: {},
  label: {},
  categorization: {},
});

export const useStyles = (element?: UISchemaElement): Styles => {
  const userStyles = inject('styles', defaultStyles);
  if (!element?.options?.styles) {
    return userStyles;
  }
  const styles = createEmptyStyles();
  if (userStyles) {
    merge(styles, userStyles);
  } else {
    merge(styles, defaultStyles);
  }
  if (element?.options?.styles) {
    merge(styles, element.options.styles);
  }
  return styles;
};


export const defaultStyles: BopStyles = {
  categorization: {
    root: 'categorization',
    category: 'tabs',
    selected: 'selected',
    panel: 'panel',
  },
  allOf: {
    root: 'allof',
  },
  oneOf: {
    root: 'oneof',
    select: 'oneof-select',
  },
  anyOf: {
    root: 'categorization',
    category: 'tabs',
    selected: 'selected',
    panel: 'panel',
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
  toggle: {
    root: 'toggle',
    slider: 'slider',
  },
};

export interface BopStyles {
  categorization: {
    root?: string;
    category?: string;
    selected?: string;
    panel?: string;
  };
  oneOf: {
    root?: string;
    select?: string;
  };
  allOf: {
    root?: string;
  };
  anyOf: {
    root?: string;
    category?: string;
    selected?: string;
    panel?: string;
  };
  objectAddProps: {
    root?: string;
    toolbar?: string;
    items?: string;
  };
  enumArray: {
    root?: string;
    item?: string;
    label?: string;
  };
  toggle: {
    root?: string;
    slider?: string;
  };
}
